import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShoppingCart } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await axios.get('/api/wishlist', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setWishlist(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const handleRemove = async (id) => {
        try {
            await axios.delete(`/api/wishlist/remove/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setWishlist(wishlist.filter(item => item._id !== id));
        } catch (err) {
            alert('Failed to remove from wishlist');
        }
    };

    if (loading) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>{[...Array(4)].map((_, i) => <Skeleton key={i} height="250px" />)}</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>My Wishlist</h2>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
                    Your wishlist is empty.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                    {wishlist.map(item => (
                        <div key={item._id} className="card" style={{ padding: '15px' }}>
                            <div style={{ height: '140px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginBottom: '12px', overflow: 'hidden', position: 'relative' }}>
                                {item.productId?.images?.[0] ? <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${item.productId.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                                <button 
                                    onClick={() => handleRemove(item._id)}
                                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.8)', color: 'white', padding: '6px', borderRadius: '50%' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.productId?.title || 'Product Unavailable'}</h4>
                            <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '10px' }}>{formatCurrency(item.productId?.price)}</div>
                            <Link to={`/products/${item.productId?._id}`} className="btn-primary" style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '8px', fontSize: '0.8rem' }}>View Product</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
