const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    },
    requiredItems: {
      type: [String],
      required: [true, 'At least one required item must be specified'],
      validate: {
        validator: function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        message: 'Recipient must require at least one item'
      }
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Fulfilled'],
      default: 'Active'
    },
    organizationOrShelter: {
      type: String,
      trim: true,
      default: ''
    },
    familyMembersCount: {
      type: Number,
      default: 1,
      min: [1, 'Family members count must be at least 1']
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    registeredDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

recipientSchema.index({ name: 1 });
recipientSchema.index({ phone: 1 });
recipientSchema.index({ status: 1 });

module.exports = mongoose.model('Recipient', recipientSchema);
