const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const generateOrderNumber = require('../utils/generateOrderId');
const { addNotification } = require('../utils/notificationHelper');

const placeOrder = async (req, res) => {
  const studentId = req.student._id;
  const { items: requestItems } = req.body;

  // Allow placing order either from cart or custom list
  const cart = await Cart.findOne({ studentId }).populate('products.productId');
  const itemsFromCart = cart ? cart.products : [];

  const items = requestItems && requestItems.length ? requestItems : itemsFromCart;
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items to order' });
  }

  // Normalize items list
  const normalized = [];
  let total = 0;

  for (const entry of items) {
    const id = entry.productId || entry._id || entry.product?._id;
    if (!id) continue;

    const product = await Product.findById(id);
    if (!product) continue;

    const quantity = Math.max(1, parseInt(entry.quantity || entry.qty || 1, 10));
    const price = product.price;

    normalized.push({ productId: product._id, name: product.name, quantity, price });
    total += price * quantity;
  }

  if (normalized.length === 0) {
    return res.status(400).json({ message: 'No valid products found' });
  }

  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    studentId,
    items: normalized,
    totalPrice: total,
    status: 'Order placed',
  });

  // Update stock for each item
  for (const item of normalized) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
  }

  // Clear student cart
  await Cart.findOneAndUpdate({ studentId }, { products: [] });

  addNotification(studentId, `Order ${orderNumber} was placed successfully.`);

  // Emit real-time events
  if (global.io) {
    // Create notification in database for admin
    try {
      const adminNotification = await Notification.create({
        recipientId: null, // Broadcast to all admins
        recipientType: 'Admin',
        type: 'new_order_received',
        title: 'New Order Received',
        message: `New order #${orderNumber} placed`,
        orderId: order._id,
        read: false
      });
    } catch (err) {
      console.error('Error creating admin notification:', err);
    }

    // Get all admins in admin-room and increment badge
    const unreadAdminOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    // Notify admin of new order with badge
    global.io.to('admin-room').emit('new-order', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      studentId: studentId.toString(),
      items: order.items,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      badge: unreadAdminOrders // Unseen orders count
    });

    // Notify student dashboard of order update
    global.io.to(`student-${studentId}`).emit('order-placed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt
    });

    // Emit stock update event for each product
    for (const item of normalized) {
      const updatedProduct = await Product.findById(item.productId);
      global.io.emit('stock-updated', {
        productId: item.productId.toString(),
        productName: item.name,
        newStock: updatedProduct.stock,
        minStock: updatedProduct.minStock
      });
    }
  }

  res.status(201).json(order);
};

const getStudentOrders = async (req, res) => {
  const studentId = req.student._id;
  const orders = await Order.find({ studentId }).sort({ createdAt: -1 });
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Only allow student to fetch their own order
  if (String(order.studentId) !== String(req.student?._id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(order);
};

const getAllOrders = async (req, res) => {
  const { rollNo, orderNumber, status, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (rollNo) {
    // req.query is rollNo, meaning student rollNo
    const student = await require('../models/Student').findOne({ rollNo: rollNo.trim() });
    if (student) filter.studentId = student._id;
  }
  if (orderNumber) {
    filter.orderNumber = { $regex: orderNumber, $options: 'i' };
  }
  if (status) {
    filter.status = status;
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.json({ orders, total, page: Number(page), limit: Number(limit) });
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  await order.save();

  addNotification(order.studentId, `Order ${order.orderNumber} status updated to '${status}'.`);

  // Create notification in database for student
  if (global.io) {
    try {
      await Notification.create({
        recipientId: order.studentId,
        recipientType: 'Student',
        type: 'order_status_updated',
        title: 'Order Status Updated',
        message: `Order #${order.orderNumber} is now ${status}`,
        orderId: order._id,
        read: false
      });
    } catch (err) {
      console.error('Error creating student notification:', err);
    }

    // Get unread updates count for this student
    const unreadUpdates = await Notification.countDocuments({
      recipientId: order.studentId,
      recipientType: 'Student',
      read: false
    });

    // Emit order status update to student with badge
    global.io.to(`student-${order.studentId}`).emit('order-status-updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: status,
      badge: unreadUpdates
    });

    // Also notify admin of status change
    global.io.to('admin-room').emit('order-status-changed', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: status,
      studentId: order.studentId.toString()
    });
  }

  res.json(order);
};

module.exports = {
  placeOrder,
  getStudentOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
