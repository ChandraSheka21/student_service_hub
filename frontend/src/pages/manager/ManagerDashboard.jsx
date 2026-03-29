import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { LayoutDashboard, PackageSearch, LogOut, TrendingUp, AlertTriangle, ListOrdered } from 'lucide-react';
import { motion } from 'framer-motion';

function ManagerDashboard() {
    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('manager_auth')) {
            navigate('/login');
            return;
        }
        fetchData();
        // Set up polling every 15 seconds for real-time vibe
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [ordersData, analyticsData] = await Promise.all([
                api.getManagerOrders(),
                api.getManagerAnalytics()
            ]);
            setOrders(ordersData);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.updateOrderStatus(id, newStatus);
            fetchData(); // Refresh to get updated inventory and status
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('manager_auth');
        navigate('/login');
    };

    const statusOptions = ['Received', 'Packing', 'Ready for Pickup', 'Completed'];

    return (
        <div className="page" style={{ background: '#f8fafc' }}>
            <nav className="navbar">
                <div className="navbar-brand">
                    <LayoutDashboard size={24} /> <span>Manager Dashboard</span>
                </div>
                <div className="navbar-nav">
                    <Link to="/manager/dashboard" className="nav-link active">Orders</Link>
                    <Link to="/manager/products" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <PackageSearch size={18} /> Inventory
                    </Link>
                    <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            <main className="main-content container">
                {loading && !analytics ? <p>Loading dashboard...</p> : (
                    <>
                        {/* Analytics Section */}
                        <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card stat-card">
                                <div>
                                    <div className="stat-label">Daily Orders</div>
                                    <div className="stat-value">{analytics?.total_daily_orders || 0}</div>
                                </div>
                                <div className="stat-icon"><ListOrdered size={24} /></div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card stat-card">
                                <div>
                                    <div className="stat-label">Best Selling</div>
                                    <div className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>
                                        {analytics?.best_selling_items?.[0] ? analytics.best_selling_items[0].name : 'N/A'}
                                    </div>
                                </div>
                                <div className="stat-icon" style={{ background: '#dcfce7', color: 'var(--success)' }}><TrendingUp size={24} /></div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card stat-card">
                                <div>
                                    <div className="stat-label">Low Stock Alerts</div>
                                    <div className="stat-value" style={{ color: analytics?.low_stock_alerts?.length > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                                        {analytics?.low_stock_alerts?.length || 0} items
                                    </div>
                                </div>
                                <div className="stat-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}><AlertTriangle size={24} /></div>
                            </motion.div>
                        </div>

                        {/* Orders Section */}
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Recent Orders
                        </h2>
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border)' }}>
                                    <tr>
                                        <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Order ID</th>
                                        <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Student</th>
                                        <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Time</th>
                                        <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Items</th>
                                        <th style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-muted)' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, idx) => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>#{order.id}</td>
                                            <td style={{ padding: '1rem' }}>{order.roll_number}</td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge badge-${order.status.split(' ')[0]}`}>{order.status}</span>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                {order.items?.map(i => <div key={i.id}>{i.quantity}x {i.name}</div>)}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className="input"
                                                    style={{ padding: '0.4rem', width: 'auto', minWidth: '150px' }}
                                                    disabled={order.status === 'Completed'}
                                                >
                                                    {statusOptions.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders today yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default ManagerDashboard;
