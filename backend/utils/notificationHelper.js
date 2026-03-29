/**
 * Simple in-memory notification queue (for demo purposes).
 * In a real app this would be replaced with WebSockets, push notifications, or persisted notifications.
 */

const notifications = new Map();

const addNotification = (studentId, message) => {
  const list = notifications.get(String(studentId)) || [];
  list.unshift({ id: Date.now(), message, createdAt: new Date() });
  notifications.set(String(studentId), list.slice(0, 20));
};

const getNotifications = (studentId) => {
  return notifications.get(String(studentId)) || [];
};

module.exports = { addNotification, getNotifications };
