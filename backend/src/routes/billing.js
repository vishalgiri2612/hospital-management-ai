const express = require('express');
const router = express.Router();
const {
  getBills,
  getBillById,
  createBill,
  updateBill,
  processPayment,
} = require('../controllers/billingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getBills);
router.post('/', authorize('admin', 'receptionist'), createBill);
router.get('/:id', getBillById);
router.put('/:id', authorize('admin', 'receptionist'), updateBill);
router.post('/:id/payment', authorize('admin', 'receptionist'), processPayment);

module.exports = router;
