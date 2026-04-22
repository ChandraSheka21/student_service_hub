import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../services/api';

function AdminStock({ socketEvents = {} }) {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        minStock: '',
        price: '',
        category: ''
    });

    // Load products from database
    useEffect(() => {
        fetchProducts();
    }, []);

    // Refresh when real-time events occur
    useEffect(() => {
        if (socketEvents.stockUpdated) {
            console.log('Stock updated via Socket.io, refreshing products');
            fetchProducts();
        }
        if (socketEvents.newOrder) {
            console.log('New order placed, refreshing products');
            fetchProducts();
        }
    }, [socketEvents.stockUpdated, socketEvents.newOrder]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.getAdminProducts();
            const products = Array.isArray(response.items) ? response.items : [];
            
            // Map database fields to component fields
            const mappedProducts = products.map(p => ({
                _id: p._id,
                name: p.name,
                category: p.category,
                quantity: p.stock,
                minStock: p.minStock || 10,
                price: p.price,
                image: p.image
            }));
            
            setStock(mappedProducts);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const lowStockItems = stock.filter(item => item.quantity <= item.minStock);

    const handleAddNew = () => {
        setEditingItem(null);
        setFormData({ name: '', quantity: '', minStock: '10', price: '', category: '' });
        setShowAddModal(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            quantity: item.quantity.toString(),
            minStock: item.minStock.toString(),
            price: item.price.toString(),
            category: item.category
        });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.name || formData.quantity === '' || !formData.price) {
            alert('Please fill all required fields');
            return;
        }

        try {
            setSaving(true);
            
            const productData = {
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                stock: parseInt(formData.quantity),
                minStock: parseInt(formData.minStock) || 10
            };

            if (editingItem) {
                // Update existing product
                await api.updateAdminProduct(editingItem._id, productData);
            } else {
                // Create new product
                await api.createAdminProduct(productData);
            }

            await fetchProducts();
            setShowAddModal(false);
        } catch (err) {
            console.error('Error saving product:', err);
            alert('Failed to save product: ' + (err.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

        try {
            setSaving(true);
            await api.deleteAdminProduct(item._id);
            await fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Failed to delete product: ' + (err.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleQuickUpdate = async (itemId, newQuantity, newMinStock) => {
        try {
            await api.updateAdminProduct(itemId, {
                stock: parseInt(newQuantity),
                minStock: parseInt(newMinStock) || 10
            });
            await fetchProducts();
        } catch (err) {
            console.error('Error updating stock:', err);
            alert('Failed to update stock');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Loading stock items...</p>
                </div>
            </div>
        );
    }

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

            {/* Error Alert */}
            {error && (
                <div style={{
                    padding: '1rem',
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    borderRadius: '0.5rem',
                    color: '#991B1B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <AlertCircle size={20} />
                    <p style={{ margin: 0 }}>{error}</p>
                </div>
            )}

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem',
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        borderRadius: '0.5rem',
                        color: '#991B1B',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                    }}
                >
                    <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                    <div>
                        <strong>Low Stock Alert!</strong>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} {lowStockItems.length > 1 ? 'are' : 'is'} below minimum stock level:
                            {lowStockItems.map(item => ` ${item.name}`).join(', ')}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Stock Table */}
            <motion.div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <h3 style={{ marginTop: 0 }}>Current Stock Levels</h3>

                {stock.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No stock items. <button onClick={handleAddNew} style={{ cursor: 'pointer', color: 'var(--primary)', border: 'none', background: 'none', textDecoration: 'underline' }}>Add first item</button>
                    </p>
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
                                <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>Quantity</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>Min Stock</th>
                                <th style={{ textAlign: 'right', padding: '0.75rem', fontWeight: '600' }}>Price</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>Status</th>
                                <th style={{ textAlign: 'center', padding: '0.75rem', fontWeight: '600' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {stock.map((item, index) => {
                                    const isLowStock = item.quantity <= item.minStock;
                                    return (
                                        <motion.tr
                                            key={item._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            style={{
                                                borderBottom: '1px solid var(--border)',
                                                background: isLowStock ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                                            }}
                                        >
                                            <td style={{ padding: '0.75rem', fontWeight: '500' }}>{item.name}</td>
                                            <td style={{ padding: '0.75rem' }}>{item.category || 'General'}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newVal = parseInt(e.target.value);
                                                        setStock(stock.map(s => s._id === item._id ? { ...s, quantity: newVal } : s));
                                                    }}
                                                    onBlur={() => handleQuickUpdate(item._id, item.quantity, item.minStock)}
                                                    style={{
                                                        width: '70px',
                                                        padding: '0.4rem',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '0.25rem',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    value={item.minStock}
                                                    onChange={(e) => {
                                                        const newVal = parseInt(e.target.value);
                                                        setStock(stock.map(s => s._id === item._id ? { ...s, minStock: newVal } : s));
                                                    }}
                                                    onBlur={() => handleQuickUpdate(item._id, item.quantity, item.minStock)}
                                                    style={{
                                                        width: '70px',
                                                        padding: '0.4rem',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '0.25rem',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '500' }}>₹{item.price}</td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <motion.span
                                                    layout
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '0.25rem 0.75rem',
                                                        background: isLowStock ? '#FEE2E2' : '#DBEAFE',
                                                        color: isLowStock ? '#991B1B' : '#0284C7',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {isLowStock ? 'Low' : 'OK'}
                                                </motion.span>
                                            </td>
                                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        disabled={saving}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: saving ? 'not-allowed' : 'pointer',
                                                            color: 'var(--primary)',
                                                            padding: '0.25rem',
                                                            opacity: saving ? 0.5 : 1
                                                        }}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        disabled={saving}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: saving ? 'not-allowed' : 'pointer',
                                                            color: '#EF4444',
                                                            padding: '0.25rem',
                                                            opacity: saving ? 0.5 : 1
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
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
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
                        }}
                        onClick={() => !saving && setShowAddModal(false)}
                    >
                        <motion.div
                            className="card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                maxWidth: '500px',
                                width: '90%',
                                padding: '2rem'
                            }}
                            onClick={(e) => e.stopPropagation()}
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
                                        disabled={saving}
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
                                        disabled={saving}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="input-label">Quantity (Stock) *</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            placeholder="0"
                                            disabled={saving}
                                        />
                                    </div>

                                    <div>
                                        <label className="input-label">Min Stock Alert</label>
                                        <input
                                            type="number"
                                            className="input"
                                            value={formData.minStock}
                                            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                            placeholder="10"
                                            disabled={saving}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Price (₹) *</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0"
                                        disabled={saving}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="btn"
                                        disabled={saving}
                                        style={{ opacity: saving ? 0.5 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="btn btn-primary"
                                        disabled={saving}
                                        style={{ opacity: saving ? 0.5 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                                    >
                                        {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminStock;
