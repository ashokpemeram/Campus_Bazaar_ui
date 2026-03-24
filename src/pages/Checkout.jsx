import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, MapPin, Phone, User, Package, ChevronLeft, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const [shippingDetails, setShippingDetails] = useState({
        name: user?.name || '',
        phone: '',
        address: '',
        college: user?.college || ''
    });

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axios.get('/api/cart', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (!res.data || res.data.items.length === 0) {
                    navigate('/cart');
                    return;
                }
                setCart(res.data);
            } catch (err) {
                console.error(err);
                navigate('/cart');
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [navigate]);

    const handleInputChange = (e) => {
        setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
    };

    const subtotal = cart?.items.reduce((acc, item) => acc + (item.productId?.price * item.quantity), 0) || 0;
    const shipping = 5;
    const total = subtotal + shipping;

    const placeOrder = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const orderData = {
                products: cart.items.map(item => ({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: item.productId.price
                })),
                totalAmount: total,
                shippingAddress: shippingDetails,
                paymentMethod: 'COD'
            };

            await axios.post('/api/orders', orderData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            toast.success('Order placed successfully!');
            navigate('/order-success');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ padding: '40px 20px' }}>
                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '20px' }}>
                    <ChevronLeft size={18} /> Back to Cart
                </Link>
                
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '40px' }}>Checkout</h1>

                <form onSubmit={placeOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }} className="responsive-stack">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Shipping Section */}
                        <div className="card" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <MapPin size={22} style={{ color: 'var(--primary)' }} />
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Shipping Details</h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                        <input 
                                            type="text" 
                                            name="name"
                                            required
                                            value={shippingDetails.name}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            required
                                            placeholder="+1 (555) 000-0000"
                                            value={shippingDetails.phone}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }} 
                                        />
                                    </div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>College / Campus</label>
                                    <input 
                                        type="text" 
                                        name="college"
                                        required
                                        value={shippingDetails.college}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }} 
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Full Address (Hostel/Hall & Room No.)</label>
                                    <textarea 
                                        name="address"
                                        required
                                        rows="3"
                                        value={shippingDetails.address}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white', resize: 'none' }} 
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Payment Section */}
                        <div className="card" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                                <CreditCard size={22} style={{ color: 'var(--primary)' }} />
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Payment Method</h2>
                            </div>
                            
                            <div style={{ padding: '20px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e33', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <CheckCircle size={20} style={{ color: '#22c55e' }} />
                                <div>
                                    <div style={{ fontWeight: 'bold', color: 'white' }}>Cash on Delivery (COD)</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Pay securely when you receive your items on campus.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="card" style={{ padding: '30px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '20px' }}>Order Summary</h2>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                                {cart.items.map(item => (
                                    <div key={item.productId?._id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${item.productId?.images?.[0]}`} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{item.productId?.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Qty: {item.quantity}</div>
                                        </div>
                                        <div style={{ fontWeight: 'bold' }}>${(item.productId?.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)' }}>
                                    <span>Delivery</span>
                                    <span>${shipping.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}>
                                    <span>Total</span>
                                    <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="btn-primary" 
                                style={{ width: '100%', marginTop: '30px', padding: '15px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                <Package size={20} /> {processing ? 'Placing Order...' : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
