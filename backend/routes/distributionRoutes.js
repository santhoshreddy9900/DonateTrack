const express = require('express');
const router = express.Router();
const {
  getDistributions,
  addDistribution,
  updateDistribution,
  deleteDistribution
} = require('../controllers/distributionController');

router.route('/')
  .get(getDistributions)
  .post(addDistribution);

router.route('/:id')
  .put(updateDistribution)
  .delete(deleteDistribution);

module.exports = router;
