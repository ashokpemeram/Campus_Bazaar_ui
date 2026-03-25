import { useState, useEffect } from 'react';
import axios from 'axios';
import Skeleton from '../../components/Skeleton';
import { User, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const SoldProducts = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const res = await axios.get('/api/orders/sales/user', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSales(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    if (loading) return <div style={{ display: 'grid', gap: '20px' }}>{[...Array(3)].map((_, i) => <Skeleton key={i} height="120px" />)}</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>Sold Products</h2>

            {sales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
                    No sales recorded yet.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {sales.map(sale => (
                        <div key={sale._id} style={{ background: 'var(--glass)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                                        {sale.products[0]?.productId?.images?.[0] ? <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${sale.products[0].productId.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{sale.products[0]?.productId?.title || 'Product Deleted'}</h4>
                                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={14} /> {sale.buyerId?.name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {new Date(sale.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#22c55e' }}>
                                        {formatCurrency(sale.totalAmount)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', marginTop: '8px' }}>Payment Received</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SoldProducts;
