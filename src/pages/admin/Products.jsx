import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/admin/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAction = async (id, action) => {
        try {
            await axios.patch(`/api/admin/products/${id}/${action}`);
            fetchProducts();
        } catch (err) {
            alert(`Failed to ${action} product`);
        }
    };

    const handleViewDetails = (productId) => {
        navigate(`/admin/product/${productId}`);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/admin/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const statusColors = {
        pending: '#f59e0b',
        approved: '#10b981',
        rejected: '#f43f5e',
        reserved: '#3b82f6',
        sold: '#64748b'
    };

    return (
        <AdminLayout title="Product Moderation">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {products.map(product => (
                    <div key={product._id} className="card glass animate-fade" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', height: '180px', background: 'rgba(0,0,0,0.3)' }}>
                            {product.images?.[0] ? <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${product.images[0]}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>No Image</div>}
                            <div style={{ position: 'absolute', top: '15px', right: '15px', padding: '6px 12px', background: `${statusColors[product.status]}20`, color: statusColors[product.status], borderRadius: '30px', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${statusColors[product.status]}50` }}>
                                {product.status.toUpperCase()}
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                <h3 style={{ fontSize: '1.1rem' }}>{product.title}</h3>
                                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{formatCurrency(product.price)}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '15px', height: '36px', overflow: 'hidden' }}>{product.description}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{product.sellerId?.name.charAt(0)}</div>
                                <span>{product.sellerId?.name}</span>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {product.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleAction(product._id, 'approve')} style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                        <button onClick={() => handleAction(product._id, 'reject')} style={{ flex: 1, background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                            <XCircle size={16} /> Reject
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleViewDetails(product._id)}
                                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                >
                                    <ExternalLink size={16} /> View Details
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
};

export default Products;
