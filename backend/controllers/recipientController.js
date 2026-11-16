const Recipient = require('../models/Recipient');
const Distribution = require('../models/Distribution');

// @desc    Get all recipients with optional search & filter
// @route   GET /api/recipients
const getRecipients = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50, sort = '-createdAt' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { organizationOrShelter: { $regex: search, $options: 'i' } },
        { requiredItems: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Recipient.countDocuments(query);
    const recipients = await Recipient.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: recipients.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: recipients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recipient with distribution history
// @route   GET /api/recipients/:id
const getRecipientById = async (req, res, next) => {
  try {
    const recipient = await Recipient.findById(req.params.id);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: `Recipient not found with id of ${req.params.id}`
      });
    }

    // Also fetch distributions made to this recipient
    const distributions = await Distribution.find({ recipient: req.params.id }).sort('-distributionDate');

    res.status(200).json({
      success: true,
      data: {
        ...recipient.toObject(),
        distributionHistory: distributions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new recipient
// @route   POST /api/recipients
const addRecipient = async (req, res, next) => {
  try {
    const { name, phone, address, requiredItems, organizationOrShelter, familyMembersCount, notes, status } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Recipient name, phone number, and address are required.'
      });
    }

    // Process requiredItems: could be array or comma-separated string
    let parsedItems = [];
    if (Array.isArray(requiredItems)) {
      parsedItems = requiredItems.map((i) => String(i).trim()).filter(Boolean);
    } else if (typeof requiredItems === 'string') {
      parsedItems = requiredItems.split(',').map((i) => i.trim()).filter(Boolean);
    }

    if (parsedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one required item.'
      });
    }

    const recipient = await Recipient.create({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      requiredItems: parsedItems,
      organizationOrShelter: organizationOrShelter ? organizationOrShelter.trim() : '',
      familyMembersCount: familyMembersCount ? Number(familyMembersCount) : 1,
      notes: notes ? notes.trim() : '',
      status: status || 'Active',
      registeredDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Recipient registered successfully!',
      data: recipient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recipient
// @route   PUT /api/recipients/:id
const updateRecipient = async (req, res, next) => {
  try {
    const recipient = await Recipient.findById(req.params.id);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: `Recipient not found with id of ${req.params.id}`
      });
    }

    const { name, phone, address, requiredItems, organizationOrShelter, familyMembersCount, notes, status } = req.body;

    if (name) recipient.name = name.trim();
    if (phone) recipient.phone = phone.trim();
    if (address) recipient.address = address.trim();
    if (organizationOrShelter !== undefined) recipient.organizationOrShelter = organizationOrShelter.trim();
    if (familyMembersCount) recipient.familyMembersCount = Number(familyMembersCount);
    if (notes !== undefined) recipient.notes = notes.trim();
    if (status) recipient.status = status;

    if (requiredItems) {
      let parsedItems = [];
      if (Array.isArray(requiredItems)) {
        parsedItems = requiredItems.map((i) => String(i).trim()).filter(Boolean);
      } else if (typeof requiredItems === 'string') {
        parsedItems = requiredItems.split(',').map((i) => i.trim()).filter(Boolean);
      }
      if (parsedItems.length > 0) {
        recipient.requiredItems = parsedItems;
      }
    }

    await recipient.save();

    res.status(200).json({
      success: true,
      message: 'Recipient updated successfully!',
      data: recipient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recipient
// @route   DELETE /api/recipients/:id
const deleteRecipient = async (req, res, next) => {
  try {
    const recipient = await Recipient.findById(req.params.id);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: `Recipient not found with id of ${req.params.id}`
      });
    }

    // Check if recipient has distribution records
    const distributionCount = await Distribution.countDocuments({ recipient: req.params.id });
    if (distributionCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete recipient "${recipient.name}" because they have ${distributionCount} recorded distribution(s). You may mark them as 'Fulfilled' instead.`
      });
    }

    await Recipient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Recipient deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecipients,
  getRecipientById,
  addRecipient,
  updateRecipient,
  deleteRecipient
};
