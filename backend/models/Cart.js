const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1, default: 1 },
      priceAtAdd: { type: Number, required: true, min: 0 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

CartSchema.index({ studentId: 1 });

module.exports = mongoose.model('Cart', CartSchema);
