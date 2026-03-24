import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShoppingCart, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const res = await axios.get('/api/cart', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCart(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const res = await axios.patch('/api/cart/update', { productId, quantity: newQuantity }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCart(res.data);
        } catch (err) {
            toast.error('Failed to update quantity');
        }
    };

    const removeItem = async (productId) => {
        try {
            await axios.delete(`/api/cart/remove/${productId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setCart({ ...cart, items: cart.items.filter(item => item.productId._id !== productId) });
            toast.success('Item removed');
        } catch (err) {
            toast.error('Failed to remove item');
        }
    };

    const subtotal = cart?.items.reduce((acc, item) => acc + (item.productId?.price * item.quantity), 0) || 0;
    const shipping = subtotal > 0 ? 5 : 0; // Flat shipping fee for campus
    const total = subtotal + shipping;

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ padding: '40px 20px' }}>
                <Skeleton height="50px" width="300px" style={{ marginBottom: '30px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                    <Skeleton height="400px" />
                    <Skeleton height="300px" />
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ padding: '40px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                        <ShoppingCart size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Shopping Cart</h1>
                </div>

                {!cart || cart.items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--glass)', borderRadius: '20px' }}>
                        <ShoppingBag size={60} style={{ color: 'var(--text-dim)', marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Your cart is empty</h3>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>Start Shopping</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }} className="responsive-stack">
                        {/* Cart Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {cart.items.map(item => (
                                <div key={item.productId?._id} className="card animate-fade" style={{ display: 'flex', padding: '20px', gap: '25px', position: 'relative' }}>
                                    <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${item.productId?.images?.[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{item.productId?.title}</h3>
                                            <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>${item.productId?.price}</span>
                                        </div>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '15px' }}>Category: {item.productId?.category}</p>
                                        
                                        {!item.productId?.isAvailable && (
                                            <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '15px', fontSize: '0.9rem' }}>
                                                ⚠️ This item was recently sold and is no longer available.
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 12px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                                Qty: 1 (Single Item)
                                            </div>
                                            <button 
                                                onClick={() => removeItem(item.productId?._id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                            >
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '25px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>Order Summary</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                                    <span>Campus Delivery</span>
                                    <span>${shipping.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.3rem', marginTop: '10px', color: 'white' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => navigate('/checkout')}
                                disabled={cart.items.some(item => !item.productId?.isAvailable)}
                                className="btn-primary" 
                                style={{ 
                                    width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 'bold',
                                    opacity: cart.items.some(item => !item.productId?.isAvailable) ? 0.5 : 1,
                                    cursor: cart.items.some(item => !item.productId?.isAvailable) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {cart.items.some(item => !item.productId?.isAvailable) ? 'Sold Out Items in Cart' : 'Proceed to Checkout'} <ArrowRight size={20} />
                            </button>
                            
                            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '20px' }}>
                                Prices include all applicable taxes and fees.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
