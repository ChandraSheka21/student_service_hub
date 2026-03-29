import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Package, Bell, Warehouse, FileText, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminDashboardHome from './sections/DashboardHome';
import AdminOrders from './sections/Orders';
import AdminNotifications from './sections/Notifications';
import AdminStock from './sections/Stock';
import AdminReports from './sections/Reports';

function AdminDashboard() {
    const [adminUsername, setAdminUsername] = useState('');
    const [activeSection, setActiveSection] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('admin_token')) {
            navigate('/login');
            return;
        }
        
        const username = localStorage.getItem('admin_username');
        setAdminUsername(username);
        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_auth');
        navigate('/login');
    };

    if (loading) {
        return <div className="page" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }

    const sections = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'stock', label: 'Stock', icon: Warehouse },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const renderSection = () => {
        switch(activeSection) {
            case 'dashboard':
                return <AdminDashboardHome />;
            case 'orders':
                return <AdminOrders />;
            case 'notifications':
                return <AdminNotifications />;
            case 'stock':
                return <AdminStock />;
            case 'reports':
                return <AdminReports />;
            default:
                return <AdminDashboardHome />;
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'var(--surface)' }}>
            {/* Sidebar */}
            <motion.div
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                style={{
                    width: '250px',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '2rem 1rem',
                    overflowY: 'auto',
                    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 'bold' }}>Campus Admin</h2>
                
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {sections.map((section) => {
                        const IconComponent = section.icon;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                style={{
                                    background: activeSection === section.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'left'
                                }}
                                className="btn"
                            >
                                <IconComponent size={20} />
                                {section.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        color: 'white',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.9rem',
                        marginTop: 'auto',
                        width: '100%',
                        transition: 'all 0.3s ease'
                    }}
                    className="btn"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </motion.div>

            {/* Main Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>
                        {sections.find(s => s.id === activeSection)?.label || 'Dashboard'}
                    </h1>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Welcome, <strong>{adminUsername}</strong>
                    </div>
                </div>

                {/* Content Section */}
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ flex: 1 }}
                >
                    {renderSection()}
                </motion.div>
            </div>
        </div>
    );
}

export default AdminDashboard;
