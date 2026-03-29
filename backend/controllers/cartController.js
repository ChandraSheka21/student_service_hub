const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  const studentId = req.student._id;
  const cart = await Cart.findOne({ studentId }).populate('products.productId');
  res.json(cart || { products: [] });
};

const addToCart = async (req, res) => {
  const studentId = req.student._id;
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId required' });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const priceAtAdd = product.price;
  const qty = Math.max(1, parseInt(quantity, 10));

  const cart = await Cart.findOneAndUpdate(
    { studentId },
    {
      $setOnInsert: { studentId },
      $set: { updatedAt: new Date() },
      $push: { products: { productId, quantity: qty, priceAtAdd } },
    },
    { upsert: true, new: true }
  );

  res.json(cart);
};

const updateCartItem = async (req, res) => {
  const studentId = req.student._id;
  const { productId, quantity } = req.body;
  if (!productId || quantity == null) {
    return res.status(400).json({ message: 'productId and quantity are required' });
  }

  const cart = await Cart.findOne({ studentId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  const item = cart.products.find((p) => String(p.productId) === String(productId));
  if (!item) return res.status(404).json({ message: 'Item not in cart' });

  item.quantity = Math.max(1, parseInt(quantity, 10));
  cart.updatedAt = new Date();
  await cart.save();

  res.json(cart);
};

const removeCartItem = async (req, res) => {
  const studentId = req.student._id;
  const { productId } = req.params;
  const cart = await Cart.findOne({ studentId });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });

  cart.products = cart.products.filter((p) => String(p.productId) !== String(productId));
  cart.updatedAt = new Date();
  await cart.save();

  res.json(cart);
};

const clearCart = async (req, res) => {
  const studentId = req.student._id;
  await Cart.findOneAndUpdate({ studentId }, { products: [], updatedAt: new Date() });
  res.json({ message: 'Cart cleared' });
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
