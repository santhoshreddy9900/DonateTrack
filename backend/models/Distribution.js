const mongoose = require('mongoose');

const distributionSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipient',
      required: [true, 'Recipient is required']
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Distributed quantity is required'],
      min: [1, 'Distributed quantity must be at least 1']
    },
    unit: {
      type: String,
      default: 'units',
      trim: true
    },
    distributionDate: {
      type: Date,
      default: Date.now,
      required: [true, 'Distribution date is required']
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Cancelled'],
      default: 'Completed'
    },
    distributedBy: {
      type: String,
      default: 'Student Volunteer',
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

distributionSchema.index({ recipient: 1 });
distributionSchema.index({ itemName: 1 });
distributionSchema.index({ distributionDate: -1 });

module.exports = mongoose.model('Distribution', distributionSchema);
