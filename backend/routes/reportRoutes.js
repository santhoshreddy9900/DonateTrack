const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getCategoryStats
} = require('../controllers/reportController');

router.get('/dashboard', getDashboardData);
router.get('/category-stats', getCategoryStats);

module.exports = router;
