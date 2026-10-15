const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
} = require('../controllers/order.controller');

const router = express.Router();

router.use(protect);
router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
