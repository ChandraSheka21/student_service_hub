import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldCheck, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const studentRoll = localStorage.getItem('student_roll');
        const adminToken = localStorage.getItem('admin_token');

        if (adminToken) {
            navigate('/admin/dashboard');
        } else if (studentRoll) {
            navigate('/student/dashboard');
        }
    }, [navigate]);

    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="page" style={{ 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '2rem',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)',
            minHeight: '100vh'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}
            >
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                    Campus Stationery Hub
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                    Your one-stop solution for all campus stationery needs
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="card"
                        onClick={() => handleNavigate('/login')}
                        style={{
                            padding: '2rem',
                            cursor: 'pointer',
                            border: '2px solid var(--primary)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{
                            background: 'var(--primary)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            margin: '0 auto 1rem'
                        }}>
                            <BookOpen size={32} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Student Login</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Access your orders and manage purchases
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="card"
                        onClick={() => handleNavigate('/login')}
                        style={{
                            padding: '2rem',
                            cursor: 'pointer',
                            border: '2px solid var(--primary)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{
                            background: 'var(--primary)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            margin: '0 auto 1rem'
                        }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Admin Access</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Manage products and monitor sales
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="card"
                        onClick={() => handleNavigate('/login')}
                        style={{
                            padding: '2rem',
                            cursor: 'pointer',
                            border: '2px solid var(--primary)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{
                            background: 'var(--primary)',
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            margin: '0 auto 1rem'
                        }}>
                            <BarChart3 size={32} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>Manager Portal</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Track inventory and revenue
                        </p>
                    </motion.div>
                </div>

                <button
                    onClick={() => handleNavigate('/login')}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                >
                    Get Started
                </button>
            </motion.div>
        </div>
    );
}

export default Home;
