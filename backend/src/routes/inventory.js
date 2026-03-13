const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  restockItem,
  getLowStockAlerts,
  getPredictedDemand,
} = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getInventory);
router.post('/', authorize('admin'), createInventoryItem);
router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/ai/predicted-demand', authorize('admin'), getPredictedDemand);
router.get('/:id', getInventoryItemById);
router.put('/:id', authorize('admin'), updateInventoryItem);
router.post('/:id/restock', authorize('admin'), restockItem);

module.exports = router;
