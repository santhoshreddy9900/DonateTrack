const Donation = require('../models/Donation');
const Distribution = require('../models/Distribution');

/**
 * Helper to calculate stock for a single item (case-insensitive match)
 * @param {string} itemName
 * @param {string} [excludeDistributionId] Optional distribution id to exclude (for updates)
 */
const calculateItemStock = async (itemName, excludeDistributionId = null) => {
  if (!itemName) return { totalCollected: 0, totalDistributed: 0, availableStock: 0 };

  const itemRegex = new RegExp(`^${itemName.trim()}$`, 'i');

  // Sum collected donations for this item
  const donationAgg = await Donation.aggregate([
    { $match: { itemName: { $regex: itemRegex } } },
    { $group: { _id: null, total: { $sum: '$quantity' }, unit: { $first: '$unit' }, category: { $first: '$category' } } }
  ]);
  const totalCollected = donationAgg.length > 0 ? donationAgg[0].total : 0;
  const unit = donationAgg.length > 0 ? donationAgg[0].unit : 'units';
  const category = donationAgg.length > 0 ? donationAgg[0].category : 'Other Essentials';

  // Sum distributions for this item (excluding cancelled, and optionally excluding current record if updating)
  const distMatch = {
    itemName: { $regex: itemRegex },
    status: { $ne: 'Cancelled' }
  };

  if (excludeDistributionId) {
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(excludeDistributionId)) {
      distMatch._id = { $ne: new mongoose.Types.ObjectId(excludeDistributionId) };
    }
  }

  const distAgg = await Distribution.aggregate([
    { $match: distMatch },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);
  const totalDistributed = distAgg.length > 0 ? distAgg[0].total : 0;
  const availableStock = Math.max(0, totalCollected - totalDistributed);

  return {
    itemName: itemName.trim(),
    category,
    unit,
    totalCollected,
    totalDistributed,
    availableStock
  };
};

// @desc    Get aggregated inventory of all items
// @route   GET /api/inventory
const getInventory = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;

    // 1. Group all donations by normalized item name
    const donationSummary = await Donation.aggregate([
      {
        $group: {
          _id: { $toLower: { $trim: { input: '$itemName' } } },
          displayName: { $first: '$itemName' },
          category: { $first: '$category' },
          unit: { $first: '$unit' },
          totalCollected: { $sum: '$quantity' },
          donationCount: { $sum: 1 },
          lastDonatedDate: { $max: '$donationDate' }
        }
      }
    ]);

    // 2. Group all distributions (non-cancelled) by normalized item name
    const distributionSummary = await Distribution.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $toLower: { $trim: { input: '$itemName' } } },
          totalDistributed: { $sum: '$quantity' },
          distributionCount: { $sum: 1 },
          lastDistributedDate: { $max: '$distributionDate' }
        }
      }
    ]);

    // Create a map for quick distribution lookup
    const distMap = new Map();
    distributionSummary.forEach((d) => {
      distMap.set(d._id, d);
    });

    // 3. Merge data to calculate current remaining stock
    let inventory = donationSummary.map((item) => {
      const distInfo = distMap.get(item._id);
      const totalDistributed = distInfo ? distInfo.totalDistributed : 0;
      const remainingStock = item.totalCollected - totalDistributed;

      let stockStatus = 'In Stock';
      if (remainingStock <= 0) {
        stockStatus = 'Out of Stock';
      } else if (remainingStock <= 10) {
        stockStatus = 'Low Stock';
      }

      return {
        id: item._id,
        itemName: item.displayName,
        category: item.category,
        unit: item.unit || 'units',
        totalCollected: item.totalCollected,
        totalDistributed,
        remainingStock: Math.max(0, remainingStock),
        deficit: remainingStock < 0 ? Math.abs(remainingStock) : 0,
        donationCount: item.donationCount,
        distributionCount: distInfo ? distInfo.distributionCount : 0,
        stockStatus,
        lastDonatedDate: item.lastDonatedDate,
        lastDistributedDate: distInfo ? distInfo.lastDistributedDate : null
      };
    });

    // Filtering by search term
    if (search) {
      const s = search.toLowerCase();
      inventory = inventory.filter(
        (i) => i.itemName.toLowerCase().includes(s) || i.category.toLowerCase().includes(s)
      );
    }

    // Filtering by category
    if (category && category !== 'All') {
      inventory = inventory.filter((i) => i.category === category);
    }

    // Filtering by stock status
    if (status && status !== 'All') {
      inventory = inventory.filter((i) => i.stockStatus === status);
    }

    // Sort by remainingStock ascending or descending
    inventory.sort((a, b) => b.totalCollected - a.totalCollected);

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory summary metrics (collected, distributed, remaining)
// @route   GET /api/inventory/summary
const getInventorySummary = async (req, res, next) => {
  try {
    const totalCollectedAgg = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const totalDistributedAgg = await Distribution.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const totalCollected = totalCollectedAgg.length > 0 ? totalCollectedAgg[0].total : 0;
    const totalDistributed = totalDistributedAgg.length > 0 ? totalDistributedAgg[0].total : 0;
    const availableInventory = Math.max(0, totalCollected - totalDistributed);

    res.status(200).json({
      success: true,
      data: {
        totalCollected,
        totalDistributed,
        availableInventory
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check item available stock
// @route   GET /api/inventory/check/:itemName
const checkItemStock = async (req, res, next) => {
  try {
    const { itemName } = req.params;
    const stockInfo = await calculateItemStock(itemName);

    res.status(200).json({
      success: true,
      data: stockInfo
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateItemStock,
  getInventory,
  getInventorySummary,
  checkItemStock
};
