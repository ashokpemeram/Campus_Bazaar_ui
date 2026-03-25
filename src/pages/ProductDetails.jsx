import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, ShoppingCart } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/currency';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
            const res = await axios.get(`/api/products/${id}`, { headers });
            setProduct(res.data);
            setNotFound(false);
        } catch (err) {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchSimilar = async () => {
        try {
            const res = await axios.get(`/api/products/recommend/${id}`, { params: { limit: 8 } });
            setSimilarProducts(res.data || []);
        } catch (err) {
            console.error(err);
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
        fetchProduct();
        fetchSimilar();
    }, [id]);

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    const handleAddToCart = async (item) => {
        if (!user) return toast.error('Please login first');
        if (item.sellerId?._id === user.id) return toast.error('You cannot buy your own product');

        try {
            await axios.post('/api/cart/add', { productId: item._id }, {
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

    const handleChatWithSeller = (item) => {
        if (!user) return toast.error('Please login first');
        if (item.sellerId?._id === user.id) return toast.error('You cannot chat with yourself');
        const params = new URLSearchParams({
            productId: item._id,
            userId: item.sellerId?._id || '',
            name: item.sellerId?.name || 'Seller',
            title: item.title || 'Product'
        });
        navigate(`/messages?${params.toString()}`);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
                <Navbar />
                <div className="container" style={{ padding: '60px 20px' }}>
                    <div className="card" style={{ padding: '40px', textAlign: 'center' }}>Loading product...</div>
                </div>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
                <Navbar />
                <div className="container" style={{ padding: '60px 20px' }}>
                    <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                        <p style={{ marginBottom: '20px', color: 'var(--text-dim)' }}>Product not found.</p>
                        <Link to="/products" className="btn-primary" style={{ padding: '10px 18px', display: 'inline-block' }}>Back to Marketplace</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Navbar />
            <main className="container" style={{ padding: '40px 20px 80px' }}>
                <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '20px' }}>
                    <ArrowLeft size={16} /> Back to Marketplace
                </Link>

                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 420px) 1fr', gap: '30px' }}>
                    <div style={{ borderRadius: '16px', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', minHeight: '320px' }}>
                        {product.images?.[0] ? (
                            <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${product.images[0]}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>No Image</div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '6px' }}>{product.category}</div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px' }}>{product.title}</h1>
                            <div style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: '800' }}>{formatCurrency(product.price)}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                            <span className="glass" style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '0.85rem' }}>Condition: {product.condition}</span>
                            <span className="glass" style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '0.85rem' }}>Seller: {product.sellerId?.name || 'User'}</span>
                            {typeof product.views === 'number' ? (
                                <span className="glass" style={{ padding: '6px 12px', borderRadius: '999px', fontSize: '0.85rem' }}>Views: {product.views}</span>
                            ) : null}
                        </div>

                        <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>{product.description}</p>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button className="btn-primary" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleAddToCart(product)}>
                                <ShoppingCart size={18} /> Add to Cart
                            </button>
                            <button className="btn-secondary" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => handleChatWithSeller(product)}>
                                <MessageCircle size={18} /> Chat with Seller
                            </button>
                            <button
                                onClick={() => toggleWishlist(product._id)}
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--border)', color: wishlist.includes(product._id) ? '#ef4444' : 'white', padding: '10px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Heart size={18} fill={wishlist.includes(product._id) ? '#ef4444' : 'none'} />
                                {wishlist.includes(product._id) ? 'Wishlisted' : 'Add to Wishlist'}
                            </button>
                        </div>
                    </div>
                </div>

                <section style={{ marginTop: '50px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.6rem' }}>Similar Products</h2>
                        <Link to="/products" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>Browse More</Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                        {similarProducts.length > 0 ? similarProducts.map(item => (
                            <div key={item._id} className="card">
                                <div style={{ height: '160px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden', position: 'relative' }}>
                                    {item.images?.[0] ? (
                                        <Link to={`/products/${item._id}`} style={{ display: 'block', height: '100%' }}>
                                            <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${item.images[0]}`} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </Link>
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>No Image</div>
                                    )}
                                    <button 
                                        onClick={() => toggleWishlist(item._id)}
                                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: wishlist.includes(item._id) ? '#ef4444' : 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
                                    >
                                        <Heart size={18} fill={wishlist.includes(item._id) ? '#ef4444' : 'none'} />
                                    </button>
                                </div>
                                <Link to={`/products/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{item.title}</h3>
                                </Link>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(item.price)}</span>
                                    <button className="btn-primary" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => handleAddToCart(item)}>
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                                No similar products found yet.
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProductDetails;
