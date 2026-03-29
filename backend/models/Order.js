const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    },
  ],
  totalPrice: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['Order placed', 'In queue', 'Packed successfully', 'Ready to collect', 'Delivered'],
    default: 'Order placed',
  },
  createdAt: { type: Date, default: Date.now },
});

OrderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', OrderSchema);
