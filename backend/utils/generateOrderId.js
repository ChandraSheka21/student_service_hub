const Order = require('../models/Order');
const Counter = require('../models/Counter');

/**
 * Generates a new unique order number like ORD2026000001
 * Uses an atomic counter document so concurrent order placement cannot produce duplicates.
 */
const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `ORD${year}`;

  let orderNumber;

  while (true) {
    const counter = await Counter.findOneAndUpdate(
      { name: `order-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    orderNumber = `${prefix}${String(counter.seq).padStart(6, '0')}`;

    const existingOrder = await Order.exists({ orderNumber });
    if (!existingOrder) {
      break;
    }
  }

  return orderNumber;
};

module.exports = generateOrderNumber;
