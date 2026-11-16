const Donation = require('../models/Donation');
const { calculateItemStock } = require('./inventoryController');

// @desc    Get all donations with optional filtering & pagination
// @route   GET /api/donations
const getDonations = async (req, res, next) => {
  try {
    const { search, category, startDate, endDate, page = 1, limit = 50, sort = '-donationDate' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { donorName: { $regex: search, $options: 'i' } },
        { donorEmail: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.donationDate = {};
      if (startDate) query.donationDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.donationDate.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Donation.countDocuments(query);
    const donations = await Donation.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
const getDonationById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: `Donation not found with id of ${req.params.id}`
      });
    }
    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new donation
// @route   POST /api/donations
const addDonation = async (req, res, next) => {
  try {
    const { itemName, category, quantity, unit, donorName, donorPhone, donorEmail, donationDate, notes } = req.body;

    if (!itemName || !category || !quantity || !donorName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide item name, category, quantity, and donor name.'
      });
    }

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than 0.'
      });
    }

    const donation = await Donation.create({
      itemName: itemName.trim(),
      category,
      quantity: parsedQuantity,
      unit: unit ? unit.trim() : 'units',
      donorName: donorName.trim(),
      donorPhone: donorPhone ? donorPhone.trim() : '',
      donorEmail: donorEmail ? donorEmail.trim() : '',
      donationDate: donationDate ? new Date(donationDate) : new Date(),
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully!',
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation
// @route   PUT /api/donations/:id
const updateDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: `Donation not found with id of ${req.params.id}`
      });
    }

    const { itemName, category, quantity, unit, donorName, donorPhone, donorEmail, donationDate, notes } = req.body;

    // Check inventory stock integrity if quantity is being decreased
    if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (isNaN(newQty) || newQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number.'
        });
      }

      // Check current stock for this item
      const stock = await calculateItemStock(donation.itemName);
      const difference = donation.quantity - newQty;

      if (difference > 0 && stock.availableStock - difference < 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce quantity to ${newQty}. ${stock.totalDistributed} units have already been distributed. Current available inventory is only ${stock.availableStock}.`
        });
      }
      donation.quantity = newQty;
    }

    if (itemName) donation.itemName = itemName.trim();
    if (category) donation.category = category;
    if (unit) donation.unit = unit.trim();
    if (donorName) donation.donorName = donorName.trim();
    if (donorPhone !== undefined) donation.donorPhone = donorPhone.trim();
    if (donorEmail !== undefined) donation.donorEmail = donorEmail.trim();
    if (donationDate) donation.donationDate = new Date(donationDate);
    if (notes !== undefined) donation.notes = notes.trim();

    await donation.save();

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully!',
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
const deleteDonation = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: `Donation not found with id of ${req.params.id}`
      });
    }

    // Check if removing this donation would cause negative stock
    const stock = await calculateItemStock(donation.itemName);
    if (stock.availableStock - donation.quantity < 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this donation of ${donation.quantity} ${donation.itemName}. ${stock.totalDistributed} units have already been distributed to recipients. Only ${stock.availableStock} are currently remaining in stock.`
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDonations,
  getDonationById,
  addDonation,
  updateDonation,
  deleteDonation
};
