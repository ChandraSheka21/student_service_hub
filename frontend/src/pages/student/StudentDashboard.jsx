import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ShoppingCart, LogOut, Package, Clock, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function StudentDashboard() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const rollNumber = localStorage.getItem('student_roll');
    const navigate = useNavigate();

    useEffect(() => {
        if (!rollNumber) {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [rollNumber, navigate]);

    const fetchProducts = async () => {
        try {
            const data = await api.getStudentProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existing = prevCart.find(item => item.product_id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prevCart; // limit to stock
                return prevCart.map(item =>
                    item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { product_id: product.id, name: product.name, price: product.price, quantity: 1, maxStock: product.stock }];
        });
    };

    const updateQuantity = (id, delta) => {
        setCart(prevCart =>
            prevCart.map(item => {
                if (item.product_id === id) {
                    const newQ = item.quantity + delta;
                    if (newQ > 0 && newQ <= item.maxStock) {
                        return { ...item, quantity: newQ };
                    }
                }
                return item;
            })
        );
    };

    const removeFromCart = (id) => {
        setCart(prevCart => prevCart.filter(item => item.product_id !== id));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setCheckoutLoading(true);
        try {
            const itemsPayload = cart.map(c => ({ product_id: c.product_id, quantity: c.quantity }));
            const res = await api.placeOrder(rollNumber, itemsPayload);

            if (res.error) throw new Error(res.error);

            alert(`Order placed successfully! Order ID: ${res.order_id}\nEstimated Pickup: ${new Date(res.estimated_pickup_time).toLocaleTimeString()}`);
            setCart([]);
            navigate('/student/orders');
        } catch (err) {
            alert(err.message || 'Checkout failed');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('student_roll');
        navigate('/login');
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="page">
            <nav className="navbar">
                <Link to="/student/dashboard" className="navbar-brand">
                    <Package size={24} /> <span>Stationery Store</span>
                </Link>
                <div className="navbar-nav">
                    <Link to="/student/orders" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={18} /> My Orders
                    </Link>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{rollNumber}</span>
                    <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem', background: '#f1f5f9' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            <main className="main-content container grid" style={{ gridTemplateColumns: '1fr 350px', alignItems: 'start' }}>
                {/* Products Section */}
                <div>
                    <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Available Items
                    </h2>
                    {loading ? (
                        <p>Loading products...</p>
                    ) : (
                        <div className="grid grid-cols-3">
                            {products.map(product => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="card" style={{ display: 'flex', flexDirection: 'column' }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{product.name}</h3>
                                        <p style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                            ₹{product.price.toFixed(2)}
                                        </p>
                                        <p style={{ fontSize: '0.875rem', color: product.stock < 10 ? 'var(--warning)' : 'var(--text-muted)' }}>
                                            Stock: {product.stock} left
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="btn btn-secondary"
                                        style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                                    >
                                        Add to Cart
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Sidebar */}
                <div className="card" style={{ position: 'sticky', top: '100px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                        <ShoppingCart size={20} /> Your Cart
                    </h2>

                    <AnimatePresence>
                        {cart.length === 0 ? (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                                Your cart is empty.
                            </motion.p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {cart.map(item => (
                                    <motion.div
                                        key={item.product_id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.name}</p>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>₹{item.price.toFixed(2)}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <button onClick={() => updateQuantity(item.product_id, -1)} style={{ border: 'none', background: 'white', borderRadius: '4px', padding: '0.2rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                                                <Minus size={14} />
                                            </button>
                                            <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.product_id, 1)} style={{ border: 'none', background: 'white', borderRadius: '4px', padding: '0.2rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                                                <Plus size={14} />
                                            </button>
                                            <button onClick={() => removeFromCart(item.product_id)} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: '0.5rem' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}

                                <div style={{ marginTop: '1rem', borderTop: '2px dashed var(--border)', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                                        <span>Total:</span>
                                        <span>₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="btn btn-primary"
                                        style={{ width: '100%', py: '1rem' }}
                                        disabled={checkoutLoading}
                                    >
                                        {checkoutLoading ? 'Processing...' : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default StudentDashboard;
