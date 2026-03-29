import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminReports() {
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState('month');

    const salesData = [
        { date: 'Mar 15', orders: 12, revenue: 6000 },
        { date: 'Mar 16', orders: 18, revenue: 9200 },
        { date: 'Mar 17', orders: 15, revenue: 7500 },
        { date: 'Mar 18', orders: 22, revenue: 11000 },
        { date: 'Mar 19', orders: 19, revenue: 9500 },
        { date: 'Mar 20', orders: 24, revenue: 12500 }
    ];

    const topItems = [
        { name: 'Notebooks', sold: 156, revenue: 7800 },
        { name: 'Pens', sold: 342, revenue: 3420 },
        { name: 'A4 Sheets', sold: 98, revenue: 19600 },
        { name: 'Erasers', sold: 287, revenue: 1435 },
        { name: 'Pencils', sold: 205, revenue: 1640 }
    ];

    const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
    const averageOrderValue = totalRevenue / totalOrders;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Report Controls */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div>
                        <label className="input-label">Report Type</label>
                        <select
                            className="input"
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="sales">Sales Report</option>
                            <option value="inventory">Inventory Report</option>
                            <option value="students">Students Report</option>
                            <option value="payments">Payments Report</option>
                        </select>
                    </div>

                    <div>
                        <label className="input-label">Date Range</label>
                        <select
                            className="input"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Download size={18} /> Export Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
            }}>
                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1.5rem',
                        borderTop: '4px solid #3B82F6',
                        textAlign: 'center'
                    }}
                >
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Revenue</p>
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>
                        ₹{totalRevenue.toLocaleString()}
                    </p>
                </motion.div>

                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        padding: '1.5rem',
                        borderTop: '4px solid #10B981',
                        textAlign: 'center'
                    }}
                >
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Orders</p>
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>
                        {totalOrders}
                    </p>
                </motion.div>

                <motion.div
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        padding: '1.5rem',
                        borderTop: '4px solid #F59E0B',
                        textAlign: 'center'
                    }}
                >
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Average Order Value</p>
                    <p style={{ margin: '0.75rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>
                        ₹{averageOrderValue.toFixed(0)}
                    </p>
                </motion.div>
            </div>

            {/* Sales Chart Simulation */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0 }}>Daily Sales Trend</h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.75rem',
                    height: '200px',
                    padding: '1rem 0'
                }}>
                    {salesData.map((day, index) => (
                        <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: `${(day.revenue / 12500) * 100}%` }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                flex: 1,
                                background: '#3B82F6',
                                borderRadius: '0.5rem 0.5rem 0 0',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'background 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
                            title={`${day.date}: ₹${day.revenue}`}
                        />
                    ))}
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: '1rem'
                }}>
                    {salesData.map((day, index) => (
                        <span key={index}>{day.date}</span>
                    ))}
                </div>
            </div>

            {/* Top Selling Items */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0 }}>Top Selling Items</h3>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Item</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Units Sold</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Revenue</th>
                            <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Market Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topItems.map((item, index) => {
                            const totalSold = topItems.reduce((sum, i) => sum + i.sold, 0);
                            const marketShare = ((item.sold / totalSold) * 100).toFixed(1);
                            return (
                                <motion.tr
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ borderBottom: '1px solid var(--border)' }}
                                >
                                    <td style={{ padding: '0.75rem', fontWeight: '500' }}>{item.name}</td>
                                    <td style={{ padding: '0.75rem' }}>{item.sold}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: '500', color: '#10B981' }}>₹{item.revenue}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{
                                                width: '60px',
                                                height: '6px',
                                                background: 'var(--border)',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${marketShare}%`,
                                                    height: '100%',
                                                    background: '#3B82F6'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem' }}>{marketShare}%</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminReports;
