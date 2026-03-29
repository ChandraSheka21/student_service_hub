import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

function AdminStock() {
    const [stock, setStock] = useState([
        { id: 1, name: 'Notebooks', quantity: 15, minStock: 20, price: 50, category: 'Stationery', lastUpdated: '2024-03-20' },
        { id: 2, name: 'Pens', quantity: 45, minStock: 30, price: 10, category: 'Writing', lastUpdated: '2024-03-20' },
        { id: 3, name: 'Erasers', quantity: 8, minStock: 15, price: 5, category: 'Stationery', lastUpdated: '2024-03-19' },
        { id: 4, name: 'Pencils', quantity: 62, minStock: 40, price: 8, category: 'Writing', lastUpdated: '2024-03-20' },
        { id: 5, name: 'A4 Sheets', quantity: 120, minStock: 100, price: 200, category: 'Paper', lastUpdated: '2024-03-20' }
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        minStock: '',
        price: '',
        category: ''
    });

    const lowStockItems = stock.filter(item => item.quantity <= item.minStock);

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({ name: '', quantity: '', minStock: '', price: '', category: '' });
        setShowAddModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData(item);
        setShowAddModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.quantity || !formData.price) {
            alert('Please fill all required fields');
            return;
        }

        if (editingItem) {
            setStock(stock.map(item =>
                item.id === editingItem.id
                    ? { ...formData, id: item.id, lastUpdated: new Date().toISOString().split('T')[0] }
                    : item
            ));
        } else {
            setStock([...stock, {
                ...formData,
                id: stock.length + 1,
                lastUpdated: new Date().toISOString().split('T')[0]
            }]);
        }

        setShowAddModal(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            setStock(stock.filter(item => item.id !== id));
        }
    };

    const updateQuantity = (id, newQuantity) => {
        setStock(stock.map(item =>
            item.id === id
                ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] }
                : item
        ));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header with Add Button */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ margin: 0 }}>Stock Management</h2>
                <button
                    onClick={handleAddNew}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}
                >
                    <Plus size={18} /> Add New Item
                </button>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div style={{
                    padding: '1rem',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '0.5rem',
                    color: '#991B1B',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                    <div>
                        <strong>Low Stock Alert!</strong>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} {lowStockItems.length > 1 ? 'are' : 'is'} below minimum stock level:
                            {lowStockItems.map(item => ` ${item.name}`).join(',')}
                        </p>
                    </div>
                </div>
            )}

            {/* Stock Table */}
            <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <h3 style={{ marginTop: 0 }}>Current Stock Levels</h3>

                {stock.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stock items</p>
                ) : (
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.875rem'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Item Name</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Quantity</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Min Stock</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Price</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '0.75rem', fontWeight: '600' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stock.map((item, index) => {
                                const isLowStock = item.quantity <= item.minStock;
                                return (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            background: isLowStock ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{item.name}</td>
                                        <td style={{ padding: '0.75rem' }}>{item.category}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                style={{
                                                    width: '60px',
                                                    padding: '0.25rem',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '0.25rem'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>{item.minStock}</td>
                                        <td style={{ padding: '0.75rem' }}>₹{item.price}</td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '0.25rem 0.75rem',
                                                background: isLowStock ? '#FEE2E2' : '#DBEAFE',
                                                color: isLowStock ? '#991B1B' : '#0284C7',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {isLowStock ? 'Low' : 'OK'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--primary)',
                                                        padding: '0.25rem'
                                                    }}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#EF4444',
                                                        padding: '0.25rem'
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
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
                            maxWidth: '500px',
                            width: '90%',
                            padding: '2rem'
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="input-label">Item Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Notebooks"
                                />
                            </div>

                            <div>
                                <label className="input-label">Category</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g. Stationery"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="input-label">Quantity *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Min Stock</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.minStock}
                                        onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Price (₹) *</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editingItem ? 'Update' : 'Add'} Item
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default AdminStock;
