const mongoose = require('mongoose');

const donationCategories = [
  'Clothes & Apparel',
  'Food & Groceries',
  'Books & Stationery',
  'Medical & Hygiene',
  'Blankets & Bedding',
  'Toys & Recreation',
  'Other Essentials'
];

const donationSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: donationCategories,
        message: '{VALUE} is not a valid category'
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unit: {
      type: String,
      default: 'units',
      trim: true
    },
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
      maxlength: [100, 'Donor name cannot exceed 100 characters']
    },
    donorPhone: {
      type: String,
      trim: true,
      default: ''
    },
    donorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    donationDate: {
      type: Date,
      default: Date.now,
      required: [true, 'Donation date is required']
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

// Indexes for high performance querying
donationSchema.index({ itemName: 1, category: 1 });
donationSchema.index({ donationDate: -1 });

module.exports = mongoose.model('Donation', donationSchema);
module.exports.donationCategories = donationCategories;
