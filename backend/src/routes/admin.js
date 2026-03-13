const express = require('express');
const router = express.Router();
const { getDashboardStats, getCapacityForecast, getAnalytics } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/capacity-forecast', getCapacityForecast);
router.get('/analytics', getAnalytics);

module.exports = router;
