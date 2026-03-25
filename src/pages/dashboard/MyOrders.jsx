import { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from '../../components/Skeleton';
import { formatCurrency } from '../../utils/currency';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axios.get('/api/orders/my', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div style={{ display: 'grid', gap: '20px' }}>{[...Array(3)].map((_, i) => <Skeleton key={i} height="120px" />)}</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>My Orders</h2>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
                    You haven't placed any orders yet.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {orders.map(order => {
                        const normalizedStatus = order.status === 'accepted' ? 'confirmed' : order.status;
                        const statusColor = normalizedStatus === 'completed' || normalizedStatus === 'delivered'
                            ? '#22c55e'
                            : normalizedStatus === 'confirmed'
                                ? '#3b82f6'
                                : normalizedStatus === 'rejected' || normalizedStatus === 'cancelled'
                                    ? '#ef4444'
                                    : '#eab308';
                        const statusLabel = normalizedStatus === 'pending'
                            ? 'Waiting for seller approval'
                            : normalizedStatus === 'confirmed'
                                ? 'Waiting for final confirmation'
                                : normalizedStatus === 'completed'
                                    ? 'COMPLETED'
                                    : normalizedStatus === 'cancelled'
                                        ? 'NOT SOLD'
                                        : normalizedStatus.toUpperCase();
                        return (
                        <div key={order._id} style={{ background: 'var(--glass)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Order ID: {order._id.slice(-8).toUpperCase()}</div>
                                    <div style={{ fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(order.totalAmount)}</div>
                                    <div style={{ fontSize: '0.8rem', color: statusColor }}>{statusLabel}</div>
                                </div>
                            </div>
                            <div>
                                {order.products.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '15px', marginBottom: idx === order.products.length - 1 ? 0 : '10px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '5px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                            {item.productId?.images?.[0] ? <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${item.productId.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.95rem' }}>{item.productId?.title || 'Product Deleted'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Qty: {item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
