import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { BookOpen, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function Login() {
    const [rollNumber, setRollNumber] = useState('');
    const [adminUsername, setAdminUsername] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginMode, setLoginMode] = useState('student'); // 'student' or 'admin'
    const navigate = useNavigate();

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

            // Save to localStorage
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

            // Save admin token and username to localStorage
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

    return (
        <div className="page" style={{ justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card glass" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--primary)', padding: '1rem', borderRadius: '50%', color: 'white', marginBottom: '1rem' }}>
                        {loginMode === 'student' ? <BookOpen size={32} /> : <ShieldCheck size={32} />}
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Campus Stationery App</h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {loginMode === 'student' ? 'Sign in to manage your orders' : 'Admin Access'}
                    </p>
                </div>

                {/* Tab buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => { setLoginMode('student'); setError(''); }}
                        className="btn"
                        style={{
                            flex: 1,
                            background: loginMode === 'student' ? 'var(--primary)' : 'var(--border)',
                            color: loginMode === 'student' ? 'white' : 'var(--text)',
                            border: 'none'
                        }}
                    >
                        Student
                    </button>
                    <button
                        onClick={() => { setLoginMode('admin'); setError(''); }}
                        className="btn"
                        style={{
                            flex: 1,
                            background: loginMode === 'admin' ? 'var(--primary)' : 'var(--border)',
                            color: loginMode === 'admin' ? 'white' : 'var(--text)',
                            border: 'none'
                        }}
                    >
                        Admin
                    </button>
                </div>

                {/* Student Login Form */}
                {loginMode === 'student' && (
                    <form onSubmit={handleStudentLogin}>
                        <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={16} /> Roll Number
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. 19CS01"
                                value={rollNumber}
                                onChange={(e) => setRollNumber(e.target.value)}
                            />
                        </div>

                        {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Logging in...' : 'Student Login'}
                        </button>
                    </form>
                )}

                {/* Admin Login Form */}
                {loginMode === 'admin' && (
                    <form onSubmit={handleAdminLogin}>
                        <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={16} /> Username
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. stationery-admin"
                                value={adminUsername}
                                onChange={(e) => setAdminUsername(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={16} /> Password
                            </label>
                            <input
                                type="password"
                                className="input"
                                placeholder="Enter password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                            />
                        </div>

                        {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? 'Logging in...' : 'Admin Login'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

export default Login;
