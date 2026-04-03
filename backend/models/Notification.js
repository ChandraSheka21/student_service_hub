const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType'
  },
  recipientType: {
    type: String,
    enum: ['Student', 'Admin'],
    required: true
  },
  type: {
    type: String,
    enum: [
      'order_placed',
      'order_reviewed',
      'order_processing',
      'order_ready_to_collect',
      'order_delivered',
      'order_cancelled',
      'low_stock_alert',
      'new_order_received',
      'stock_updated'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

// Index for faster queries
NotificationSchema.index({ recipientId: 1, recipientType: 1, createdAt: -1 });
NotificationSchema.index({ read: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('Notification', NotificationSchema);
