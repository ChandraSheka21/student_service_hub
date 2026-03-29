import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, Truck, Gift, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminDashboardHome() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        reviewedOrders: 0,
        readyToCollect: 0,
        deliveredOrders: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        // Fetch stats from backend
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Use mock data as fallback
            setStats({
                totalOrders: 24,
                pendingOrders: 5,
                reviewedOrders: 8,
                readyToCollect: 7,
                deliveredOrders: 4,
                totalRevenue: 12500
            });
        }
    };

    const statCards = [
        { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: '#3B82F6' },
        { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: '#F59E0B' },
        { label: 'Reviewed Orders', value: stats.reviewedOrders, icon: CheckCircle, color: '#10B981' },
        { label: 'Ready to Collect', value: stats.readyToCollect, icon: Truck, color: '#8B5CF6' },
        { label: 'Delivered Orders', value: stats.deliveredOrders, icon: Gift, color: '#EC4899' },
        { label: 'Total Revenue', value: `₹${stats.totalRevenue}`, icon: TrendingUp, color: '#06B6D4' }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
            }}>
                {statCards.map((card, index) => {
                    const IconComponent = card.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card"
                            style={{
                                padding: '1.5rem',
                                borderTop: `4px solid ${card.color}`,
                                cursor: 'pointer'
                            }}
                            whileHover={{ translateY: -5 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {card.label}
                                    </p>
                                    <p style={{
                                        margin: '0.5rem 0 0 0',
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: card.color
                                    }}>
                                        {card.value}
                                    </p>
                                </div>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    background: `${card.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <IconComponent size={24} color={card.color} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ marginTop: 0 }}>Quick Actions</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem'
                }}>
                    <button className="btn btn-primary" style={{ padding: '0.75rem' }}>
                        View All Orders
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                        Manage Stock
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                        View Reports
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '0.75rem' }}>
                        Pending Reviews
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card" style={{ padding: '2rem' }}>
                <h2 style={{ marginTop: 0 }}>Recent Activity</h2>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'var(--surface)',
                        borderRadius: '0.5rem',
                        borderLeft: '4px solid #3B82F6'
                    }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: '500' }}>New order received</p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Order #ORD-2024-001
                            </p>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>10 mins ago</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'var(--surface)',
                        borderRadius: '0.5rem',
                        borderLeft: '4px solid #10B981'
                    }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: '500' }}>Order status updated</p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Order #ORD-2024-002 → Ready to Collect
                            </p>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>25 mins ago</span>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'var(--surface)',
                        borderRadius: '0.5rem',
                        borderLeft: '4px solid #F59E0B'
                    }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: '500' }}>Low stock alert</p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                Notebooks - Only 15 items remaining
                            </p>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>1 hour ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardHome;
