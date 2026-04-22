const express = require('express');
const router = express.Router();
const { authMiddleware, requireStudent, requireAdmin } = require('../middleware/authMiddleware');
const {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} = require('../controllers/notificationController');

// Get all notifications for user (student or admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const recipientType = req.student ? 'Student' : 'Admin';
    const recipientId = req.student?._id || req.admin?._id;

    // For admin, fetch both personal and broadcast notifications (recipientId = null)
    const query = recipientType === 'Admin'
      ? { recipientType, $or: [{ recipientId }, { recipientId: null }] }
      : { recipientId, recipientType };

    const notifications = await require('../models/Notification').find(query)
      .populate('orderId')
      .populate('productId')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Get unread count for user
router.get('/count/unread', authMiddleware, async (req, res) => {
  try {
    const recipientType = req.student ? 'Student' : 'Admin';
    const recipientId = req.student?._id || req.admin?._id;

    // For admin, count both personal and broadcast notifications
    const query = recipientType === 'Admin'
      ? { recipientType, read: false, $or: [{ recipientId }, { recipientId: null }] }
      : { recipientId, recipientType, read: false };

    const count = await require('../models/Notification').countDocuments(query);

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
});

// Mark all notifications as read for user
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const recipientType = req.student ? 'Student' : 'Admin';
    const recipientId = req.student?._id || req.admin?._id;

    // For admin, mark both personal and broadcast notifications as read
    const query = recipientType === 'Admin'
      ? { recipientType, read: false, $or: [{ recipientId }, { recipientId: null }] }
      : { recipientId, recipientType, read: false };

    await require('../models/Notification').updateMany(
      query,
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

// Delete all notifications for user
router.delete('/delete-all', authMiddleware, async (req, res) => {
  try {
    const recipientType = req.student ? 'Student' : 'Admin';
    const recipientId = req.student?._id || req.admin?._id;

    // For admin, delete both personal and broadcast notifications
    const query = recipientType === 'Admin'
      ? { recipientType, $or: [{ recipientId }, { recipientId: null }] }
      : { recipientId, recipientType };

    await require('../models/Notification').deleteMany(query);

    res.json({ message: 'All notifications deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notifications', error: error.message });
  }
});

// Delete single notification
router.delete('/:notificationId', authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;

    await require('../models/Notification').findByIdAndDelete(notificationId);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

module.exports = router;
