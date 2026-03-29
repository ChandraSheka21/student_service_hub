import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Package, ArrowLeft, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function StudentOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const rollNumber = localStorage.getItem('student_roll');
    const navigate = useNavigate();

    useEffect(() => {
        if (!rollNumber) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [rollNumber, navigate]);

    const fetchOrders = async () => {
        try {
            const data = await api.getStudentOrders(rollNumber);
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <nav className="navbar">
                <Link to="/student/dashboard" className="navbar-brand">
                    <Package size={24} /> <span>Stationery Store</span>
                </Link>
                <div className="navbar-nav">
                    <Link to="/student/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <ArrowLeft size={18} /> Back to Shop
                    </Link>
                </div>
            </nav>

            <main className="main-content container">
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={24} color="var(--primary)" /> My Past Orders
                    </h1>

                    {loading ? (
                        <p>Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
                            <Link to="/student/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Start Shopping</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {orders.map((order, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={order.id}
                                    className="card"
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Order #{order.id}</h3>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Placed on {new Date(order.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className={`badge badge-${order.status.split(' ')[0]}`}>{order.status}</span>
                                            {order.status !== 'Completed' && (
                                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                                    Estimated Pickup: {new Date(order.estimated_pickup_time).toLocaleTimeString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</h4>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {order.items.map(item => (
                                                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                                    <span><span style={{ fontWeight: '500' }}>{item.quantity}x</span> {item.name}</span>
                                                    <span>₹{(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', fontWeight: '700', fontSize: '1.1rem' }}>
                                            <span>Total: ₹{order.items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default StudentOrders;
