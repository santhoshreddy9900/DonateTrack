const Distribution = require('../models/Distribution');
const Recipient = require('../models/Recipient');
const { calculateItemStock } = require('./inventoryController');

// @desc    Get all distributions with filtering & pagination
// @route   GET /api/distributions
const getDistributions = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 50, sort = '-distributionDate' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } },
        { distributedBy: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Distribution.countDocuments(query);
    const distributions = await Distribution.find(query)
      .populate('recipient', 'name phone address')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: distributions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: distributions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a new distribution (with strict inventory check)
// @route   POST /api/distributions
const addDistribution = async (req, res, next) => {
  try {
    const { recipientId, itemName, category, quantity, unit, distributionDate, distributedBy, notes } = req.body;

    // 1. Basic validation
    if (!recipientId || !itemName || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, item name, and quantity are required.'
      });
    }

    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number greater than 0.'
      });
    }

    // 2. Verify Recipient exists
    const recipient = await Recipient.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Selected recipient does not exist.'
      });
    }

    // 3. Check inventory stock availability
    const stock = await calculateItemStock(itemName);

    if (stock.totalCollected === 0) {
      return res.status(400).json({
        success: false,
        message: `Item "${itemName}" has no recorded donations in the inventory.`
      });
    }

    if (stock.availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot distribute "${itemName}". Item is completely OUT OF STOCK (Collected: ${stock.totalCollected}, Distributed: ${stock.totalDistributed}).`
      });
    }

    if (parsedQty > stock.availableStock) {
      return res.status(400).json({
        success: false,
        message: `Cannot distribute ${parsedQty} units of "${itemName}". Only ${stock.availableStock} ${stock.unit} currently available in inventory.`
      });
    }

    // 4. Create distribution record
    const distribution = await Distribution.create({
      recipient: recipient._id,
      recipientName: recipient.name,
      itemName: itemName.trim(),
      category: category || stock.category || 'Other Essentials',
      quantity: parsedQty,
      unit: unit || stock.unit || 'units',
      distributionDate: distributionDate ? new Date(distributionDate) : new Date(),
      status: 'Completed',
      distributedBy: distributedBy ? distributedBy.trim() : 'Student Volunteer',
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: `Successfully distributed ${parsedQty} ${stock.unit} of "${itemName}" to ${recipient.name}. Remaining stock: ${stock.availableStock - parsedQty} units.`,
      data: distribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update distribution
// @route   PUT /api/distributions/:id
const updateDistribution = async (req, res, next) => {
  try {
    const distribution = await Distribution.findById(req.params.id);
    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: `Distribution not found with id of ${req.params.id}`
      });
    }

    const { recipientId, itemName, category, quantity, unit, distributionDate, distributedBy, notes, status } = req.body;

    const targetItemName = itemName ? itemName.trim() : distribution.itemName;

    if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (isNaN(newQty) || newQty <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number.'
        });
      }

      // Check stock excluding the current distribution's consumed quantity
      const stock = await calculateItemStock(targetItemName, distribution._id);
      if (newQty > stock.availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot update to ${newQty} units. Maximum available stock for "${targetItemName}" is ${stock.availableStock} ${stock.unit}.`
        });
      }

      distribution.quantity = newQty;
    }

    if (recipientId && recipientId !== String(distribution.recipient)) {
      const newRecipient = await Recipient.findById(recipientId);
      if (!newRecipient) {
        return res.status(404).json({ success: false, message: 'Recipient not found.' });
      }
      distribution.recipient = newRecipient._id;
      distribution.recipientName = newRecipient.name;
    }

    if (itemName) distribution.itemName = targetItemName;
    if (category) distribution.category = category;
    if (unit) distribution.unit = unit;
    if (distributionDate) distribution.distributionDate = new Date(distributionDate);
    if (distributedBy !== undefined) distribution.distributedBy = distributedBy.trim();
    if (notes !== undefined) distribution.notes = notes.trim();
    if (status) distribution.status = status;

    await distribution.save();

    res.status(200).json({
      success: true,
      message: 'Distribution updated successfully!',
      data: distribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete distribution (returns quantity to available inventory)
// @route   DELETE /api/distributions/:id
const deleteDistribution = async (req, res, next) => {
  try {
    const distribution = await Distribution.findById(req.params.id);
    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: `Distribution not found with id of ${req.params.id}`
      });
    }

    await Distribution.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Distribution record removed. ${distribution.quantity} ${distribution.unit} of "${distribution.itemName}" returned to available inventory.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDistributions,
  addDistribution,
  updateDistribution,
  deleteDistribution
};
