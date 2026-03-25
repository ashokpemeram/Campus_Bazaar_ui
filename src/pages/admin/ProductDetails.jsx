import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const AdminProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
                const res = await axios.get(`/api/products/${id}`, { headers });
                setProduct(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    return (
        <AdminLayout title="Product Details">
            <button
                onClick={() => navigate('/admin/products')}
                style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', padding: '8px 12px' }}
            >
                <ArrowLeft size={16} /> Back to Products
            </button>

            {loading && <div style={{ color: 'var(--text-dim)' }}>Loading...</div>}
            {error && <div style={{ color: 'var(--accent)' }}>{error}</div>}

            {!loading && !error && product && (
                <div className="card glass" style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            {product.images?.length ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                                    {product.images.map((img) => (
                                        <img
                                            key={img}
                                            src={`${import.meta.env.VITE_SERVER_URL}/uploads/${img}`}
                                            alt={product.title}
                                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '10px' }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-dim)' }}>No images</div>
                            )}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{product.title}</h2>
                            <div style={{ color: 'var(--text-dim)', marginBottom: '8px' }}>{product.description}</div>
                            <div style={{ display: 'grid', gap: '6px', marginTop: '16px', fontSize: '0.95rem' }}>
                                <div><strong>Price:</strong> {formatCurrency(product.price)}</div>
                                <div><strong>Status:</strong> {product.status}</div>
                                <div><strong>Category:</strong> {product.category}</div>
                                <div><strong>Condition:</strong> {product.condition}</div>
                                <div><strong>Seller:</strong> {product.sellerId?.name || 'Unknown'} ({product.sellerId?.email || 'N/A'})</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProductDetails;
