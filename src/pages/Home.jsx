import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const Home = () => {
    const [wishlist, setWishlist] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [trending, setTrending] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState({ recommended: true, trending: true, newArrivals: true });
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchRecommended = async () => {
        if (!user) {
            setRecommended([]);
            setLoading((prev) => ({ ...prev, recommended: false }));
            return;
        }

        try {
            const res = await axios.get(`/api/products/recommend/user/${user.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                params: { limit: 8 }
            });
            setRecommended(res.data || []);
        } catch (err) {
            console.error(err);
            setRecommended([]);
        } finally {
            setLoading((prev) => ({ ...prev, recommended: false }));
        }
    };

    const fetchTrending = async () => {
        try {
            const res = await axios.get('/api/products/trending', { params: { limit: 8 } });
            setTrending(res.data || []);
        } catch (err) {
            console.error(err);
            setTrending([]);
        } finally {
            setLoading((prev) => ({ ...prev, trending: false }));
        }
    };

    const fetchNewArrivals = async () => {
        try {
            const res = await axios.get('/api/products/new', { params: { limit: 8 } });
            setNewArrivals(res.data || []);
        } catch (err) {
            console.error(err);
            setNewArrivals([]);
        } finally {
            setLoading((prev) => ({ ...prev, newArrivals: false }));
        }
    };

    const fetchWishlist = async () => {
        if (!user) return;
        try {
            const res = await axios.get('/api/wishlist', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setWishlist(res.data.map(p => p._id));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTrending();
        fetchNewArrivals();
    }, []);

    useEffect(() => {
        fetchRecommended();
        fetchWishlist();
    }, [user]);

    const handleAddToCart = async (product) => {
        if (!user) return toast.error('Please login first');
        if (product.sellerId?._id === user.id) return toast.error('You cannot buy your own product');

        try {
            await axios.post('/api/cart/add', { productId: product._id }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success('Added to cart');
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
    };

    const toggleWishlist = async (productId) => {
        if (!user) return toast.error('Please login first');
        
        const isWishlisted = wishlist.includes(productId);
        try {
            if (isWishlisted) {
                await axios.delete(`/api/wishlist/remove/${productId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setWishlist(wishlist.filter(id => id !== productId));
                toast.success('Removed from wishlist');
            } else {
                await axios.post('/api/wishlist/add', { productId }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setWishlist([...wishlist, productId]);
                toast.success('Added to wishlist');
            }
            window.dispatchEvent(new Event('wishlistUpdated'));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const handleViewProduct = (productId) => {
        navigate(`/products/${productId}`);
    };

    const renderSection = (title, items, isLoading, emptyText, showLoginHint = false) => (
        <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '2rem' }}>{title}</h2>
                <Link to="/products" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>View All</Link>
            </div>

            {showLoginHint && !user ? (
                <div className="card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Log in to see personalized picks tailored to your activity.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                    {isLoading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-dim)' }}>Loading recommendations...</div>
                    ) : items.length > 0 ? (
                        items.map(product => (
                            <div key={product._id} className="card animate-fade" onClick={() => handleViewProduct(product._id)} style={{ cursor: 'pointer' }}>
                                <div style={{ height: '180px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '15px', overflow: 'hidden', position: 'relative' }}>
                                    {product.images?.[0] ? (
                                        <Link to={`/products/${product._id}`} style={{ display: 'block', height: '100%' }}>
                                            <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${product.images[0]}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Link>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>No Image</div>
                                    )}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWishlist(product._id);
                                        }}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: wishlist.includes(product._id) ? '#ef4444' : 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
                                    >
                                        <Heart size={18} fill={wishlist.includes(product._id) ? '#ef4444' : 'none'} />
                                    </button>
                                </div>
                                <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{product.title}</h3>
                                </Link>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)' }}>${product.price}</span>
                                    <button 
                                        className="btn-primary" 
                                        style={{ padding: '8px 15px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                    >
                                        <ShoppingCart size={16} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                            {emptyText}
                        </div>
                    )}
                </div>
            )}
        </section>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>
            <Navbar />

            <header style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h1 className="animate-fade" style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '20px' }}>Trade with your <br /><span className="gradient-text">Campus Peers</span></h1>
                <p className="animate-fade" style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px' }}>The safest and fastest way to buy and sell used items within your college community.</p>
                <div className="animate-fade" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ background: 'var(--glass)', padding: '12px 25px', borderRadius: '30px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', width: '400px' }}>
                        <Search size={20} style={{ color: 'var(--text-dim)' }} />
                        <input type="text" placeholder="Search for electronics, books, etc..." style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }} />
                    </div>
                </div>
            </header>

            <main className="container" style={{ paddingBottom: '80px' }}>
                {renderSection('Recommended for You', recommended, loading.recommended, 'No personalized recommendations yet.', true)}
                {renderSection('Trending Now', trending, loading.trending, 'No trending products yet.')}
                {renderSection('New Arrivals', newArrivals, loading.newArrivals, 'No new arrivals yet.')}
            </main>
        </div>
    );
};

export default Home;
