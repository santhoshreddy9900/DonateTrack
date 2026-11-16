const express = require('express');
const router = express.Router();
const {
  getRecipients,
  getRecipientById,
  addRecipient,
  updateRecipient,
  deleteRecipient
} = require('../controllers/recipientController');

router.route('/')
  .get(getRecipients)
  .post(addRecipient);

router.route('/:id')
  .get(getRecipientById)
  .put(updateRecipient)
  .delete(deleteRecipient);

module.exports = router;
