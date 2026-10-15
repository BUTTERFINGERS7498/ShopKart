const mongoose = require('mongoose');
const Product = require('../models/product.model');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || price === '' || !category || !image || stock === undefined || stock === '') {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
      });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    const product = await Product.create({
      name,
      description,
      price: numericPrice,
      category,
      image,
      stock: numericStock,
    });

    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.search) {
      filter.name = { $regex: escapeRegex(String(req.query.search)), $options: 'i' };
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') {
      sort = { price: 1 };
    } else if (req.query.sort === 'price_desc') {
      sort = { price: -1 };
    }

    const products = await Product.find(filter)
      .select('name price category image stock')
      .sort(sort);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(req.params.id).select(
      'name description price category image stock'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
};
