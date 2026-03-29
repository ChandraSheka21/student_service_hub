import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Mock data
            setOrders([
                {
                    id: 'ORD-001',
                    studentName: 'Rajesh Kumar',
                    studentId: '19CS001',
                    items: 'Notebooks, Pens',
                    quantity: 5,
                    amount: 500,
                    paymentStatus: 'Paid',
                    orderDate: '2024-03-20 10:30 AM',
                    status: 'Pending',
                    remarks: 'Urgent delivery needed'
                },
                {
                    id: 'ORD-002',
                    studentName: 'Priya Singh',
                    studentId: '19CS002',
                    items: 'Pen Set, Eraser',
                    quantity: 3,
                    amount: 150,
                    paymentStatus: 'Paid',
                    orderDate: '2024-03-19 03:15 PM',
                    status: 'Reviewed',
                    remarks: ''
                },
                {
                    id: 'ORD-003',
                    studentName: 'Arun Patel',
                    studentId: '19CS003',
                    items: 'A4 Sheet Bundle',
                    quantity: 10,
                    amount: 800,
                    paymentStatus: 'Pending',
                    orderDate: '2024-03-18 02:45 PM',
                    status: 'Ready to Collect',
                    remarks: ''
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const updatedOrders = orders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                );
                setOrders(updatedOrders);
                setShowStatusDropdown(null);
                // Show notification
                alert(`Order status updated to ${newStatus}`);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const statusOptions = ['Pending', 'Reviewed', 'Processing', 'Ready to Collect', 'Delivered', 'Cancelled'];

    const getStatusColor = (status) => {
        const colors = {
            'Pending': '#F59E0B',
            'Reviewed': '#3B82F6',
            'Processing': '#8B5CF6',
            'Ready to Collect': '#10B981',
            'Delivered': '#06B6D4',
            'Cancelled': '#EF4444'
        };
        return colors[status] || '#6B7280';
    };

    if (loading) {
        return <div>Loading orders...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Search and Filter */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search by name, ID, or order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Filter size={18} style={{
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }} />
                        <select
                            className="input"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Processing">Processing</option>
                            <option value="Ready to Collect">Ready to Collect</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <h2 style={{ marginTop: 0 }}>Orders ({filteredOrders.length})</h2>
                
                {filteredOrders.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders found</p>
                ) : (
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.875rem'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Order ID</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Student Name</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Student ID</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Items</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Amount</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Payment</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order, index) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{
                                        borderBottom: '1px solid var(--border)',
                                        '&:hover': { background: 'var(--surface)' }
                                    }}
                                >
                                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{order.id}</td>
                                    <td style={{ padding: '0.75rem' }}>{order.studentName}</td>
                                    <td style={{ padding: '0.75rem' }}>{order.studentId}</td>
                                    <td style={{ padding: '0.75rem' }}>{order.items}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>₹{order.amount}</td>
                                    <td style={{
                                        padding: '0.75rem',
                                        color: order.paymentStatus === 'Paid' ? '#10B981' : '#F59E0B'
                                    }}>
                                        {order.paymentStatus}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            background: `${getStatusColor(order.status)}20`,
                                            color: getStatusColor(order.status),
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowDetailModal(true);
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--primary)',
                                                    padding: '0.25rem'
                                                }}
                                                title="View details"
                                            >
                                                <Eye size={16} />
                                            </button>

                                            <div style={{ position: 'relative' }}>
                                                <button
                                                    onClick={() => setShowStatusDropdown(showStatusDropdown === order.id ? null : order.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--warning)',
                                                        padding: '0.25rem'
                                                    }}
                                                    title="Update status"
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                {showStatusDropdown === order.id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        right: 0,
                                                        background: 'white',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '0.5rem',
                                                        minWidth: '180px',
                                                        zIndex: 10,
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {statusOptions.map(status => (
                                                            <button
                                                                key={status}
                                                                onClick={() => updateOrderStatus(order.id, status)}
                                                                style={{
                                                                    display: 'block',
                                                                    width: '100%',
                                                                    textAlign: 'left',
                                                                    padding: '0.5rem 0.75rem',
                                                                    background: 'transparent',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.875rem',
                                                                    borderBottom: '1px solid var(--border)',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.background = 'var(--surface)'}
                                                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <motion.div
                        className="card"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            padding: '2rem'
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>Order Details: {selectedOrder.id}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Student Name</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500' }}>{selectedOrder.studentName}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Student ID</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500' }}>{selectedOrder.studentId}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Order Date</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500' }}>{selectedOrder.orderDate}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Amount</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontWeight: '500', color: 'var(--success)' }}>₹{selectedOrder.amount}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginTop: 0 }}>Items</h3>
                            <p>{selectedOrder.items}</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Quantity: {selectedOrder.quantity}</p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ marginTop: 0 }}>Status</h3>
                            <span style={{
                                display: 'inline-block',
                                padding: '0.5rem 1rem',
                                background: `${getStatusColor(selectedOrder.status)}20`,
                                color: getStatusColor(selectedOrder.status),
                                borderRadius: '9999px',
                                fontWeight: '600'
                            }}>
                                {selectedOrder.status}
                            </span>
                        </div>

                        {selectedOrder.remarks && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ marginTop: 0 }}>Remarks</h3>
                                <p>{selectedOrder.remarks}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" onclick={() => setShowDetailModal(false)}>
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default AdminOrders;
