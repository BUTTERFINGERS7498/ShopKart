const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const {
  COOKIE_NAME,
  generateToken,
  cookieOptions,
} = require('../utils/generateToken');

const publicCustomer = (customer) => ({
  _id: customer._id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
});

const registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existingCustomer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const customer = await Customer.create({
      fullName,
      email,
      password,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: publicCustomer(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    next(error);
  }
};

const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const passwordMatches = await bcrypt.compare(password, customer.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(customer._id);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: publicCustomer(customer),
    });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res) => {
  return res.status(200).json(publicCustomer(req.user));
};

const logoutCustomer = async (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const customer = await Customer.findById(req.user._id).select('+password');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const passwordMatches = await bcrypt.compare(oldPassword, customer.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    customer.password = newPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};
