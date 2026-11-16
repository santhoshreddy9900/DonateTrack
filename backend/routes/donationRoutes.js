const express = require('express');
const router = express.Router();
const {
  getDonations,
  getDonationById,
  addDonation,
  updateDonation,
  deleteDonation
} = require('../controllers/donationController');

router.route('/')
  .get(getDonations)
  .post(addDonation);

router.route('/:id')
  .get(getDonationById)
  .put(updateDonation)
  .delete(deleteDonation);

module.exports = router;
