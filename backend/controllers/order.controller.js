const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { getRazorpay } = require('../config/razorpay');

const requiredAddressFields = [
  ['fullName', 'Full name is required'],
  ['phone', 'Phone number is required'],
  ['addressLine1', 'Address is required'],
  ['city', 'City is required'],
  ['state', 'State is required'],
  ['pincode', 'Pincode is required'],
];

const readShippingAddress = (body) => {
  const source = body?.shippingAddress || {};
  const address = {};

  for (const [field, message] of requiredAddressFields) {
    const value = typeof source[field] === 'string' ? source[field].trim() : '';
    if (!value) {
      return { error: message };
    }
    address[field] = value;
  }

  if (!/^\d{10}$/.test(address.phone)) {
    return { error: 'Phone must be a 10-digit number' };
  }

  if (!/^\d{6}$/.test(address.pincode)) {
    return { error: 'Pincode must contain 6 digits' };
  }

  return { address };
};

const buildOrderItems = async (customer) => {
  if (!customer.cart || !customer.cart.length) {
    return { error: 'Your cart is empty', status: 400 };
  }

  const products = await Product.find({
    _id: { $in: customer.cart.map((item) => item.product) },
  });
  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const items = [];

  for (const line of customer.cart) {
    const product = productsById.get(String(line.product));

    if (!product) {
      return {
        error: 'A product in your cart is no longer available.',
        status: 400,
      };
    }

    if (line.quantity > product.stock) {
      return {
        error: `Insufficient stock for ${product.name}.`,
        status: 400,
      };
    }

    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      image: product.image,
    });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, totalAmount };
};

const createPaymentOrder = async (req, res, next) => {
  try {
    const shipping = readShippingAddress(req.body);
    if (shipping.error) {
      return res.status(400).json({
        success: false,
        message: shipping.error,
      });
    }

    const customer = await Customer.findById(req.user._id);
    const built = await buildOrderItems(customer);
    if (built.error) {
      return res.status(built.status).json({
        success: false,
        message: built.error,
      });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay test keys are not configured on the server.',
      });
    }

    // Client totals are ignored. The server prices the order from current products.
    const order = await Order.create({
      user: customer._id,
      items: built.items,
      shippingAddress: shipping.address,
      totalAmount: built.totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(built.totalAmount * 100),
        currency: 'INR',
        receipt: order._id.toString(),
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        shopKartOrderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
      });
    } catch {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(502).json({
        success: false,
        message: 'Unable to start payment. Your cart has not been cleared.',
      });
    }
  } catch (error) {
    next(error);
  }
};

const signaturesMatch = (expected, received) => {
  if (typeof received !== 'string' || expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
};

const verifyPayment = async (req, res, next) => {
  try {
    const { shopKartOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    if (!paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment details are required',
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update this order',
      });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        order,
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${order.razorpayOrderId}|${paymentId}`)
      .digest('hex');

    if (!signaturesMatch(expectedSignature, signature)) {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = paymentId;
    await order.save();

    await Customer.findByIdAndUpdate(req.user._id, { cart: [] });

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (String(order.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot view this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
};
