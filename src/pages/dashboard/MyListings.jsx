import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../../components/Skeleton';

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyListings = async () => {
            try {
                const res = await axios.get('/api/products/my', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setListings(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyListings();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;
        try {
            await axios.delete(`/api/products/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setListings(listings.filter(l => l._id !== id));
        } catch (err) {
            alert('Failed to delete listing');
        }
    };

    if (loading) return <div style={{ display: 'grid', gap: '20px' }}>{[...Array(3)].map((_, i) => <Skeleton key={i} height="80px" />)}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>My Listings</h2>
                <Link to="/add-product" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                    <Plus size={18} /> Add New
                </Link>
            </div>

            {listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
                    You haven't listed any products yet.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {listings.map(product => {
                        const statusStyles = {
                            approved: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
                            pending: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' },
                            reserved: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
                            sold: { bg: 'rgba(100, 116, 139, 0.15)', text: '#94a3b8' },
                            rejected: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' }
                        };
                        const badge = statusStyles[product.status] || statusStyles.pending;
                        return (
                        <div key={product._id} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px 20px', borderRadius: '15px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                                    {product.images?.[0] ? 
                                        <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${product.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.7rem' }}>N/A</div>
                                    }
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{product.title}</h4>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${product.price}</span>
                                        <span style={{ 
                                            fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: badge.bg,
                                            color: badge.text
                                        }}>
                                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '8px' }}><Edit size={18} /></button>
                                <button onClick={() => handleDelete(product._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px' }}><Trash2 size={18} /></button>
                                <Link to={`/products/${product._id}`} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '8px', borderRadius: '8px' }}><Eye size={18} /></Link>
                            </div>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};

export default MyListings;
