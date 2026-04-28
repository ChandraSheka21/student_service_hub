import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { ShoppingCart, Share2, User, Lock, CheckCircle, Clock, Package, BookOpen, Award, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function Login() {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginMode, setLoginMode] = useState('student'); // 'student' or 'admin'
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const isAdminDirect = searchParams.get('role') === 'admin';

    useEffect(() => {
        const role = searchParams.get('role');
        if (role === 'admin') {
            setLoginMode('admin');
        }
    }, [searchParams]);

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        if (!rollNumber) {
            setError('Please enter your roll number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await api.loginStudent(rollNumber);
            if (res.error) throw new Error(res.error);

            localStorage.setItem('student_roll', res.roll_number);
            navigate('/student/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        if (!adminUsername || !adminPassword) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: adminUsername, password: adminPassword })
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Login failed');

            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_username', data.admin.username);
            localStorage.setItem('admin_auth', 'true');
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    // Features data
    const stationeryFeatures = [
        { icon: Clock, title: 'Skip queues, order online', desc: 'Quick & easy ordering' },
        { icon: Package, title: 'Fast & easy collection', desc: 'Pickup at your convenience' },
        { icon: ShoppingCart, title: 'All essentials in one place', desc: 'Complete stationery hub' },
        { icon: Clock, title: 'Track your order live', desc: 'Real-time order status' }
    ];

    const learnFeatures = [
        { icon: BookOpen, title: 'Access notes & PYQs easily', desc: 'Study materials readily' },
        { icon: Share2, title: 'Upload & share resources', desc: 'Help the community' },
        { icon: Clock, title: 'Quick search', desc: 'Find instantly' },
        { icon: Award, title: 'Earn top contributor rank', desc: 'Recognition & rewards' }
    ];

    return (
        <div className="login-page">
            <div className="login-shell">
                <motion.div
                    className="login-page__hero"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="login-page__hero-title">Smart Service Hub</h1>
                    <p className="login-page__hero-subtitle">
                        Your complete student companion for shopping & learning
                    </p>
                </motion.div>

                <div className="login-grid">
                    <motion.div
                        className="feature-section"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="feature-section__heading">
                            <ShoppingCart size={32} />
                            <span>Stationery</span>
                        </div>
                        {stationeryFeatures.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    className="feature-card feature-card--stationery"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.08 }}
                                >
                                    <div className="feature-card__icon">
                                        <Icon size={22} />
                                    </div>
                                    <div>
                                        <h4>{feature.title}</h4>
                                        <p>{feature.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    <motion.div
                        className="auth-column"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        <div className="auth-card">
                            {!isAdminDirect && (
                                <div className="auth-tab-group">
                                    <button
                                        className={`auth-tab ${loginMode === 'student' ? 'auth-tab--active' : ''}`}
                                        onClick={() => { setLoginMode('student'); setError(''); }}
                                        type="button"
                                    >
                                        Student
                                    </button>
                                    <button
                                        className={`auth-tab ${loginMode === 'admin' ? 'auth-tab--active' : ''}`}
                                        onClick={() => { setLoginMode('admin'); setError(''); }}
                                        type="button"
                                    >
                                        Admin
                                    </button>
                                </div>
                            )}

                            {isAdminDirect && (
                                <h3 className="auth-card__title">Admin Portal</h3>
                            )}

                            {loginMode === 'student' && !isAdminDirect && (
                                <form onSubmit={handleStudentLogin} className="auth-form">
                                    <div className="input-group">
                                        <label className="input-label">Roll Number</label>
                                        <div className="input-with-icon">
                                            <User size={18} />
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="e.g. 1601-24-749-001"
                                                value={rollNumber}
                                                onChange={(e) => setRollNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {error && <div className="auth-error">{error}</div>}

                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Logging in...' : 'Enter as Student'}
                                    </button>
                                </form>
                            )}

                            {(isAdminDirect || loginMode === 'admin') && (
                                <form onSubmit={handleAdminLogin} className="auth-form">
                                    <div className="input-group">
                                        <label className="input-label">Username</label>
                                        <div className="input-with-icon">
                                            <User size={18} />
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="Admin username"
                                                value={adminUsername}
                                                onChange={(e) => setAdminUsername(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Password</label>
                                        <div className="input-with-icon">
                                            <Lock size={18} />
                                            <input
                                                type="password"
                                                className="input"
                                                placeholder="Enter password"
                                                value={adminPassword}
                                                onChange={(e) => setAdminPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {error && <div className="auth-error">{error}</div>}

                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Logging in...' : 'Enter as Admin'}
                                    </button>

                                    {isAdminDirect && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/login')}
                                        >
                                            Back to Student Login
                                        </button>
                                    )}
                                </form>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        className="feature-section"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="feature-section__heading">
                            <Share2 size={32} />
                            <span>Share & Learn</span>
                        </div>
                        {learnFeatures.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    className="feature-card feature-card--learn"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.08 }}
                                >
                                    <div className="feature-card__icon">
                                        <Icon size={22} />
                                    </div>
                                    <div>
                                        <h4>{feature.title}</h4>
                                        <p>{feature.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Login;
