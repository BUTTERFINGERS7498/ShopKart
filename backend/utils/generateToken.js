const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const generateToken = (customerId) => {
  return jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: TOKEN_MAX_AGE_MS,
};

module.exports = {
  COOKIE_NAME,
  generateToken,
  cookieOptions,
};
