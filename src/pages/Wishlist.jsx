import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchWishlist();
    }, []);

    const removeFromWishlist = async (id) => {
        try {
            await axios.delete(`/api/wishlist/remove/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setWishlist(wishlist.filter(item => item._id !== id));
            toast.success('Removed from wishlist');
        } catch (err) {
            toast.error('Failed to remove');
        }
    };

    const moveToCart = async (product) => {
        try {
            await axios.post('/api/cart/add', { productId: product._id }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Moved to cart');
            // Remove from wishlist after moving to cart
            await removeFromWishlist(product._id);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to move to cart');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ padding: '40px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <Heart size={32} style={{ color: '#ef4444' }} fill="#ef4444" />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>My Wishlist</h1>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
                        {[...Array(4)].map((_, i) => <Skeleton key={i} height="350px" />)}
                    </div>
                ) : wishlist.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--glass)', borderRadius: '20px' }}>
                        <Heart size={60} style={{ color: 'var(--text-dim)', marginBottom: '20px' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Your wishlist is empty</h3>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Save items you like to buy them later.</p>
                        <Link to="/products" className="btn-primary" style={{ textDecoration: 'none' }}>Browse Products</Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                        {wishlist.filter(p => p && p._id).map(product => (
                            <div key={product._id} className="card animate-fade" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                    <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${product.images?.[0]}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                        onClick={() => removeFromWishlist(product._id)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.8)', color: 'white', padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{product.title}</h3>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>${product.price}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                                    <button 
                                        onClick={() => moveToCart(product)}
                                        className="btn-primary" 
                                        style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                    >
                                        <ShoppingCart size={18} /> Move to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
