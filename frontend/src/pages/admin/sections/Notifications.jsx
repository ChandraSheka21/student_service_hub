import React, { useEffect, useState } from 'react';
import { Bell, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminNotifications() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'order',
            title: 'New Order Received',
            message: 'Student Rajesh Kumar placed a new order for ₹500',
            timestamp: '10 mins ago',
            read: false,
            icon: Bell,
            color: '#3B82F6'
        },
        {
            id: 2,
            type: 'stock',
            title: 'Low Stock Alert',
            message: 'Notebooks inventory is running low (15 items left)',
            timestamp: '1 hour ago',
            read: false,
            icon: AlertCircle,
            color: '#F59E0B'
        },
        {
            id: 3,
            type: 'status',
            title: 'Order Status Updated',
            message: 'Order ORD-002 has been marked as Ready to Collect',
            timestamp: '2 hours ago',
            read: true,
            icon: CheckCircle,
            color: '#10B981'
        },
        {
            id: 4,
            type: 'order',
            title: 'New Order Received',
            message: 'Student Priya Singh placed a new order for ₹150',
            timestamp: '3 hours ago',
            read: true,
            icon: Bell,
            color: '#3B82F6'
        },
        {
            id: 5,
            type: 'payment',
            title: 'Payment Received',
            message: 'Payment of ₹800 received for Order ORD-003',
            timestamp: '4 hours ago',
            read: true,
            icon: CheckCircle,
            color: '#10B981'
        }
    ]);

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notif => notif.id !== id));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h2 style={{ margin: 0 }}>Notifications</h2>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Unread Badge */}
            {unreadCount > 0 && (
                <div style={{
                    padding: '1rem',
                    background: '#EFF6FF',
                    border: '1px solid #DBEAFE',
                    borderRadius: '0.5rem',
                    color: '#0284C7'
                }}>
                    You have <strong>{unreadCount}</strong> unread notification{unreadCount > 1 ? 's' : ''}
                </div>
            )}

            {/* Notifications List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notifications.length === 0 ? (
                    <div className="card" style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        <Bell size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <p>No notifications</p>
                    </div>
                ) : (
                    notifications.map((notification, index) => {
                        const IconComponent = notification.icon;
                        return (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card"
                                style={{
                                    padding: '1.5rem',
                                    borderLeft: `4px solid ${notification.color}`,
                                    background: !notification.read ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: `${notification.color}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <IconComponent size={24} color={notification.color} />
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <h3 style={{ margin: 0, fontWeight: !notification.read ? '600' : '500' }}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: '#3B82F6'
                                                }}></span>
                                            )}
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.875rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {notification.message}
                                        </p>
                                        <p style={{
                                            margin: '0.5rem 0 0 0',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)'
                                        }}>
                                            {notification.timestamp}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#3B82F6',
                                                padding: '0.25rem'
                                            }}
                                            title="Mark as read"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#EF4444',
                                            padding: '0.25rem'
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default AdminNotifications;
