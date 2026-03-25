import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    
    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/admin/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`/api/admin/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) {
            alert('Failed to update order');
        }
    };

    return (
        <AdminLayout title="Order Tracking">
            <div className="card glass" style={{ padding: '0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Order ID</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Buyer</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Items</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Total</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Status</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Quick Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '15px 20px', fontSize: '0.85rem' }}>#{order._id.slice(-6).toUpperCase()}</td>
                                <td style={{ padding: '15px 20px' }}>{order.buyerId?.name}</td>
                                <td style={{ padding: '15px 20px' }}>{order.products.length} Items</td>
                                <td style={{ padding: '15px 20px', fontWeight: '700' }}>{formatCurrency(order.totalAmount)}</td>
                                <td style={{ padding: '15px 20px' }}>
                                    <span style={{ fontSize: '0.8rem', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px' }}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '15px 20px' }}>
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                        style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px' }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="accepted">Accepted (Legacy)</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default Orders;
