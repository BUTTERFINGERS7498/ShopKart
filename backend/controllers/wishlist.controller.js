const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const loadCustomer = (userId) => Customer.findById(userId);

const invalidId = (productId) => !mongoose.Types.ObjectId.isValid(productId);

const addToWishlist = async (req, res, next) => {
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

    const customer = await loadCustomer(req.user._id);
    const alreadySaved = customer.wishlist.some((id) => id.equals(productId));

    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock',
    });

    const wishlist = (customer.wishlist || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (invalidId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const customer = await loadCustomer(req.user._id);
    const exists = customer.wishlist.some((id) => id.equals(productId));

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    customer.wishlist.pull(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
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

    const customer = await loadCustomer(req.user._id);
    const exists = customer.wishlist.some((id) => id.equals(productId));

    if (exists) {
      customer.wishlist.pull(productId);
    } else {
      customer.wishlist.push(productId);
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      saved: !exists,
      message: exists ? 'Product removed from wishlist' : 'Product added to wishlist',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
