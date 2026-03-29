const Order = require('../models/Order');
const Product = require('../models/Product');
const Upload = require('../models/Upload');
const Student = require('../models/Student');

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const reviewedOrders = await Order.countDocuments({ status: 'Reviewed' });
    const readyToCollect = await Order.countDocuments({ status: 'Ready to Collect' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.productId', sold: { $sum: '$items.quantity' } } },
      { $sort: { sold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          name: '$product.name',
          sold: 1,
        },
      },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      reviewedOrders,
      readyToCollect,
      deliveredOrders,
      totalRevenue,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

// Get all orders with filters
const getAllOrders = async (req, res) => {
  try {
    const { status, studentName, studentId, orderId } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (studentName) filter['student.name'] = { $regex: studentName, $options: 'i' };
    if (studentId) filter['student.rollNumber'] = studentId;
    if (orderId) filter._id = orderId;

    const orders = await Order.find(filter)
      .populate('student')
      .sort({ createdAt: -1 })
      .lean();

    // Format response
    const formattedOrders = orders.map(order => ({
      id: order._id,
      studentName: order.student?.name || 'Unknown',
      studentId: order.student?.rollNumber || 'N/A',
      items: order.items?.map(item => item.name).join(', ') || 'N/A',
      quantity: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      amount: order.totalAmount || 0,
      paymentStatus: order.paymentStatus || 'Pending',
      orderDate: order.createdAt?.toLocaleString() || 'N/A',
      status: order.status || 'Pending',
      remarks: order.remarks || ''
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Reviewed', 'Processing', 'Ready to Collect', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('student');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Log to audit trail
    if (req.admin) {
      logAuditTrail({
        adminId: req.admin._id,
        action: 'UPDATE_ORDER_STATUS',
        orderId: orderId,
        oldStatus: order.status,
        newStatus: status,
        timestamp: new Date()
      });
    }

    // Send notification to student
    notifyStudent(order.student._id, {
      type: 'order_status',
      title: `Order Status Updated`,
      message: `Your order status has been updated to ${status}`,
      orderId: orderId
    });

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Get inventory/stock
const getInventory = async (req, res) => {
  try {
    const products = await Product.find({})
      .select('name stock price category')
      .lean();

    const inventory = products.map(product => ({
      id: product._id,
      name: product.name,
      quantity: product.stock || 0,
      price: product.price || 0,
      category: product.category || 'General',
      minStock: 20, // Default minimum
      lastUpdated: new Date().toISOString().split('T')[0]
    }));

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
};

// Update stock
const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { stock: quantity },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Log audit trail
    if (req.admin) {
      logAuditTrail({
        adminId: req.admin._id,
        action: 'UPDATE_STOCK',
        productId: productId,
        quantity: quantity,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Stock updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};

// Admin can verify or delete uploads
const verifyUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ message: 'Upload not found' });
    upload.verified = Boolean(verified);
    await upload.save();
    res.json(upload);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying upload', error: error.message });
  }
};

const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const upload = await Upload.findByIdAndDelete(id);
    if (!upload) return res.status(404).json({ message: 'Upload not found' });
    res.json({ message: 'Upload deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting upload', error: error.message });
  }
};

// Helper functions
const logAuditTrail = (data) => {
  // Store in database or file
  console.log('[AUDIT LOG]', data);
};

const notifyStudent = (studentId, notification) => {
  // Send notification to student
  console.log('[NOTIFICATION]', { studentId, notification });
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  updateStock,
  verifyUpload,
  deleteUpload
};
