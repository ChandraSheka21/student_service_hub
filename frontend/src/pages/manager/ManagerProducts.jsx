import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { PackageSearch, LayoutDashboard, Plus, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ManagerProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({ name: '', price: '', stock: '' });

    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('manager_auth')) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const data = await api.getManagerProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ name: product.name, price: product.price, stock: product.stock });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', price: '', stock: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock, 10)
        };

        try {
            if (editingProduct) {
                await api.updateManagerProduct(editingProduct.id, payload);
            } else {
                await api.addManagerProduct(payload);
            }
            fetchProducts();
            closeModal();
        } catch (err) {
            alert('Error saving product');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.deleteManagerProduct(id);
                fetchProducts();
            } catch (err) {
                alert('Failed to delete product');
            }
        }
    };

    return (
        <div className="page">
            <nav className="navbar">
                <div className="navbar-brand">
                    <PackageSearch size={24} /> <span>Stationery Manager</span>
                </div>
                <div className="navbar-nav">
                    <Link to="/manager/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <LayoutDashboard size={18} /> Orders
                    </Link>
                    <Link to="/manager/products" className="nav-link active">Inventory</Link>
                </div>
            </nav>

            <main className="main-content container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2>Manage Inventory</h2>
                    <button onClick={() => handleOpenModal()} className="btn btn-primary">
                        <Plus size={18} /> Add Product
                    </button>
                </div>

                {loading ? <p>Loading products...</p> : (
                    <div className="grid grid-cols-4">
                        {products.map(product => (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                        ₹{product.price.toFixed(2)}
                                    </p>
                                    <p style={{ fontSize: '0.875rem', color: product.stock < 20 ? 'var(--danger)' : 'var(--success)', fontWeight: '500' }}>
                                        Stock: {product.stock}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button onClick={() => handleOpenModal(product)} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
                                        <Pencil size={16} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="btn" style={{ background: '#fee2e2', color: 'var(--danger)', padding: '0.5rem' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="card" style={{ width: '400px', maxWidth: '90%' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                    <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="input-group">
                                        <label className="input-label">Product Name</label>
                                        <input required type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="input-group">
                                            <label className="input-label">Price (₹)</label>
                                            <input required type="number" step="0.01" min="0" className="input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                        </div>
                                        <div className="input-group">
                                            <label className="input-label">Stock</label>
                                            <input required type="number" min="0" className="input" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button type="button" onClick={closeModal} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default ManagerProducts;
