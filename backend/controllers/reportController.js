const Donation = require('../models/Donation');
const Distribution = require('../models/Distribution');
const Recipient = require('../models/Recipient');
const { donationCategories } = require('../models/Donation');

// @desc    Get dashboard summary cards and recent activities
// @route   GET /api/reports/dashboard
const getDashboardData = async (req, res, next) => {
  try {
    // 1. Total collected items
    const collectedAgg = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalCollected = collectedAgg.length > 0 ? collectedAgg[0].total : 0;

    // 2. Total items distributed (non-cancelled)
    const distributedAgg = await Distribution.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalDistributed = distributedAgg.length > 0 ? distributedAgg[0].total : 0;

    // 3. Available inventory
    const availableInventory = Math.max(0, totalCollected - totalDistributed);

    // 4. Total registered recipients
    const totalRecipients = await Recipient.countDocuments();
    const activeRecipients = await Recipient.countDocuments({ status: 'Active' });

    // 5. Total donation drives / records
    const totalDonationRecords = await Donation.countDocuments();
    const totalDistributionRecords = await Distribution.countDocuments({ status: { $ne: 'Cancelled' } });

    // 6. Recent donations (last 5)
    const recentDonations = await Donation.find()
      .sort('-donationDate')
      .limit(6);

    // 7. Recent distributions (last 5)
    const recentDistributions = await Distribution.find()
      .populate('recipient', 'name')
      .sort('-distributionDate')
      .limit(6);

    // 8. Category summary breakdown
    const categoryStats = await getCategoryBreakdownInternal();

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCollected,
          totalDistributed,
          availableInventory,
          totalRecipients,
          activeRecipients,
          totalDonationRecords,
          totalDistributionRecords
        },
        recentDonations,
        recentDistributions,
        categoryStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Internal helper for category breakdown
const getCategoryBreakdownInternal = async () => {
  // Aggregate collected by category
  const collByCategory = await Donation.aggregate([
    {
      $group: {
        _id: '$category',
        totalCollected: { $sum: '$quantity' },
        donationCount: { $sum: 1 }
      }
    }
  ]);

  // Aggregate distributed by category
  const distByCategory = await Distribution.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: '$category',
        totalDistributed: { $sum: '$quantity' },
        distributionCount: { $sum: 1 }
      }
    }
  ]);

  const collMap = new Map();
  collByCategory.forEach((c) => collMap.set(c._id, c));

  const distMap = new Map();
  distByCategory.forEach((d) => distMap.set(d._id, d));

  // Build report across all standard categories
  const categoriesList = donationCategories.map((cat) => {
    const coll = collMap.get(cat) || { totalCollected: 0, donationCount: 0 };
    const dist = distMap.get(cat) || { totalDistributed: 0, distributionCount: 0 };
    const remaining = Math.max(0, coll.totalCollected - dist.totalDistributed);

    return {
      category: cat,
      totalCollected: coll.totalCollected,
      totalDistributed: dist.totalDistributed,
      remainingStock: remaining,
      donationCount: coll.donationCount,
      distributionCount: dist.distributionCount,
      fulfillmentRate:
        coll.totalCollected > 0
          ? Math.min(100, Math.round((dist.totalDistributed / coll.totalCollected) * 100))
          : 0
    };
  });

  return categoriesList;
};

// @desc    Get detailed category-wise donation & inventory report
// @route   GET /api/reports/category-stats
const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await getCategoryBreakdownInternal();

    const overallCollected = stats.reduce((acc, curr) => acc + curr.totalCollected, 0);
    const overallDistributed = stats.reduce((acc, curr) => acc + curr.totalDistributed, 0);
    const overallRemaining = Math.max(0, overallCollected - overallDistributed);

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalCollected: overallCollected,
          totalDistributed: overallDistributed,
          remainingInventory: overallRemaining
        },
        categories: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
  getCategoryStats
};
