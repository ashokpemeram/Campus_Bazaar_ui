import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, User, Phone, MapPin, Package, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Skeleton';
import { formatCurrency } from '../../utils/currency';

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders/seller', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAcceptOrder = async (orderId) => {
        try {
            await axios.post(`/api/orders/${orderId}/accept`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Order confirmed');
            fetchOrders(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleRejectOrder = async (orderId) => {
        try {
            await axios.post(`/api/orders/${orderId}/reject`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Order rejected');
            fetchOrders(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleCompleteOrder = async (orderId) => {
        try {
            await axios.post(`/api/orders/${orderId}/complete`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Marked as sold');
            fetchOrders(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await axios.post(`/api/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Marked as not sold');
            fetchOrders(); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return <div style={{ display: 'grid', gap: '20px' }}>{[...Array(3)].map((_, i) => <Skeleton key={i} height="200px" />)}</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>Incoming Orders (Sales)</h2>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
                    No orders for your products yet.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '25px' }}>
                    {orders.map(order => {
                        const normalizedStatus = order.status === 'accepted' ? 'confirmed' : order.status;
                        const statusColors = {
                            pending: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' },
                            confirmed: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
                            completed: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
                            cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
                            rejected: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' }
                        };
                        const badge = statusColors[normalizedStatus] || statusColors.pending;
                        return (
                        <div key={order._id} style={{ background: 'var(--glass)', padding: '25px', borderRadius: '15px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '5px' }}>ORDER ID: {order._id.slice(-8).toUpperCase()}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <Clock size={16} /> {new Date(order.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                        padding: '5px 15px', 
                                        borderRadius: '20px', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 'bold',
                                        background: badge.bg,
                                        color: badge.text
                                    }}>
                                        {normalizedStatus.toUpperCase()}
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        Total: {formatCurrency(order.totalAmount)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                {/* Products */}
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Package size={18} /> Products Ordered
                                    </h4>
                                    {order.products.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                                            <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                                                {item.productId?.images?.[0] ? <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${item.productId.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.productId?.title || 'Product Deleted'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Qty: {item.quantity} x {formatCurrency(item.price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Buyer Info */}
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <User size={18} /> Shipping Details
                                    </h4>
                                    <div style={{ fontSize: '0.9rem', display: 'grid', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><User size={16} /> {order.shippingAddress.name} ({order.buyerId?.name})</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={16} /> {order.shippingAddress.phone}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={16} /> {order.shippingAddress.address}, {order.shippingAddress.college}</div>
                                    </div>
                                </div>
                            </div>

                            {normalizedStatus === 'pending' && (
                                <div style={{ display: 'flex', gap: '15px', marginTop: '25px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                    <button 
                                        onClick={() => handleAcceptOrder(order._id)}
                                        className="btn-primary" 
                                        style={{ background: '#22c55e', borderColor: '#22c55e', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <Check size={18} /> Accept Order
                                    </button>
                                    <button 
                                        onClick={() => handleRejectOrder(order._id)}
                                        className="btn-primary" 
                                        style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <X size={18} /> Reject Order
                                    </button>
                                </div>
                            )}

                            {normalizedStatus === 'confirmed' && (
                                <div style={{ display: 'flex', gap: '15px', marginTop: '25px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                    <button 
                                        onClick={() => handleCompleteOrder(order._id)}
                                        className="btn-primary" 
                                        style={{ background: '#22c55e', borderColor: '#22c55e', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <Check size={18} /> Mark as Sold
                                    </button>
                                    <button 
                                        onClick={() => handleCancelOrder(order._id)}
                                        className="btn-primary" 
                                        style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <X size={18} /> Not Sold
                                    </button>
                                </div>
                            )}
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
