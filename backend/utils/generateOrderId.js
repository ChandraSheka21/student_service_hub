const Order = require('../models/Order');

/**
 * Generates a new unique order number like ORD2025001
 */
const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `ORD${year}`;

  // Find last order for this year
  const lastOrder = await Order.findOne({ orderNumber: { $regex: `^${prefix}` } })
    .sort({ createdAt: -1 })
    .lean();

  let nextNumber = 1;
  if (lastOrder && lastOrder.orderNumber) {
    const match = lastOrder.orderNumber.match(/(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

module.exports = generateOrderNumber;
