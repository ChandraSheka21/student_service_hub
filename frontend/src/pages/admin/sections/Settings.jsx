import React, { useState } from 'react';
import { Save, Key, Bell, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminSettings() {
    const [settings, setSettings] = useState({
        notifications: true,
        emailAlerts: true,
        darkMode: false,
        autoRefresh: true,
        refreshInterval: 30
    });

    const [saved, setSaved] = useState(false);

    const handleChange = (key, value) => {
        setSettings({ ...settings, [key]: value });
        setSaved(false);
    };

    const handleSave = () => {
        localStorage.setItem('admin_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
            {saved && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                        padding: '1rem',
                        background: '#D1FAE5',
                        border: '1px solid #6EE7B7',
                        borderRadius: '0.5rem',
                        color: '#065F46'
                    }}
                >
                    ✅ Settings saved successfully
                </motion.div>
            )}

            {/* Notification Settings */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: '1.5rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Bell size={24} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notification Preferences</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.notifications}
                            onChange={(e) => handleChange('notifications', e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>Enable in-app notifications</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.emailAlerts}
                            onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>Send email notifications for orders</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={settings.autoRefresh}
                            onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>Auto-refresh dashboard data</span>
                    </label>

                    {settings.autoRefresh && (
                        <div style={{ marginLeft: '1.75rem' }}>
                            <label className="input-label">Refresh interval (seconds)</label>
                            <input
                                type="number"
                                className="input"
                                min="10"
                                max="300"
                                value={settings.refreshInterval}
                                onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Display Settings */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
                style={{ padding: '1.5rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Key size={24} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Security</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        You are logged in as <strong>{localStorage.getItem('admin_username')}</strong>
                    </p>
                    <button className="btn" style={{
                        background: '#DBEAFE',
                        color: '#0284C7',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: 'center'
                    }}>
                        <Key size={16} />
                        Change Password
                    </button>
                </div>
            </motion.div>

            {/* Save Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                onClick={handleSave}
                className="btn btn-primary"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    width: '100%'
                }}
            >
                <Save size={20} />
                Save Settings
            </motion.button>
        </div>
    );
}

export default AdminSettings;
