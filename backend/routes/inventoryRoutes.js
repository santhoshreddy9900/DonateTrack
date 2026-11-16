const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventorySummary,
  checkItemStock
} = require('../controllers/inventoryController');

router.get('/', getInventory);
router.get('/summary', getInventorySummary);
router.get('/check/:itemName', checkItemStock);

module.exports = router;
