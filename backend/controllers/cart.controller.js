const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const invalidId = (productId) => !mongoose.Types.ObjectId.isValid(productId);

const presentCart = (lines, populatedLines) =>
  lines.map((line, index) => {
    const product = populatedLines[index]?.product;

    if (product && product.name) {
      return {
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          image: product.image,
          stock: product.stock,
        },
        quantity: line.quantity,
      };
    }

    return {
      product: {
        _id: line.product,
        name: 'Unavailable product',
        price: 0,
        category: '',
        image: '',
        stock: 0,
        unavailable: true,
      },
      quantity: line.quantity,
    };
  });

const loadCart = async (userId) => {
  const [customer, populated] = await Promise.all([
    Customer.findById(userId).select('cart'),
    Customer.findById(userId).populate({
      path: 'cart.product',
      select: 'name price category image stock',
    }),
  ]);

  return presentCart(customer.cart || [], populated.cart || []);
};

const cartResponse = async (res, userId, message) => {
  const cart = await loadCart(userId);
  return res.status(200).json({
    success: true,
    message,
    cart,
  });
};

const addToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (invalidId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);
    const existing = customer.cart.find((item) => item.product.equals(productId));
    const nextQuantity = existing ? existing.quantity + 1 : 1;

    if (nextQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}.`,
      });
    }

    if (existing) {
      existing.quantity = nextQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();
    return cartResponse(res, customer._id, 'Cart updated');
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const cart = await loadCart(req.user._id);
    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (invalidId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${product.name}.`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    const existing = customer.cart.find((item) => item.product.equals(productId));

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    existing.quantity = quantity;
    await customer.save();
    return cartResponse(res, customer._id, 'Cart updated');
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (invalidId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const customer = await Customer.findById(req.user._id);
    const existing = customer.cart.find((item) => item.product.equals(productId));

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    customer.cart.pull(existing._id);
    await customer.save();
    return cartResponse(res, customer._id, 'Product removed from cart');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeFromCart,
};
