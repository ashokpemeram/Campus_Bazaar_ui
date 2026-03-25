import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, ChevronLeft, ChevronRight, ShoppingCart, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Skeleton from '../components/Skeleton';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../config/categories';
import { formatCurrency } from '../utils/currency';

const Products = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [condition, setCondition] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [sameCollegeOnly, setSameCollegeOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const categories = CATEGORIES;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                search,
                category,
                minPrice,
                maxPrice,
                condition,
                sortBy,
                limit: 8
            };
            if (sameCollegeOnly) {
                params.sameCollege = 'true';
            }
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
            const res = await axios.get('/api/products', { params, headers });
            setProducts(res.data.products);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, category, minPrice, maxPrice, condition, sortBy, page, sameCollegeOnly]);

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    useEffect(() => {
        if (!user || !user.college) {
            setSameCollegeOnly(false);
        }
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

    const handleChatWithSeller = (product) => {
        if (!user) return toast.error('Please login first');
        if (product.sellerId?._id === user.id) return toast.error('You cannot chat with yourself');
        const params = new URLSearchParams({
            productId: product._id,
            userId: product.sellerId?._id || '',
            name: product.sellerId?.name || 'Seller',
            title: product.title || 'Product'
        });
        navigate(`/messages?${params.toString()}`);
    };

    const handleViewProduct = (productId) => {
        navigate(`/products/${productId}`);
    };

    const handleCollegeFilterChange = (value) => {
        if (value) {
            if (!user) {
                toast.error('Please login to filter by college');
                setSameCollegeOnly(false);
                return;
            }
            if (!user.college) {
                toast.error('Please add your college to your profile');
                setSameCollegeOnly(false);
                return;
            }
        }
        setSameCollegeOnly(value);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Navbar />
            
            <main className="container" style={{ padding: '40px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Market<span className="gradient-text">place</span></h1>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        style={{ background: 'var(--glass)', border: '1px solid var(--border)', color: 'white', padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: showFilters ? '300px 1fr' : '1fr', gap: '40px', transition: 'all 0.3s ease' }}>
                    {showFilters && (
                        <motion.aside 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ background: 'var(--glass)', padding: '25px', borderRadius: '15px', border: '1px solid var(--border)', alignSelf: 'start' }}
                        >
                            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Filters</h3>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Search</label>
                                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '8px 12px' }}>
                                    <Search size={16} style={{ color: 'var(--text-dim)', marginRight: '8px' }} />
                                    <input 
                                        type="text" 
                                        value={search} 
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="What are you looking for?"
                                        style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Category</label>
                                <select 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>College</label>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                                        <input
                                            type="radio"
                                            name="collegeFilter"
                                            checked={!sameCollegeOnly}
                                            onChange={() => handleCollegeFilterChange(false)}
                                        />
                                        All Products
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', opacity: user && user.college ? 1 : 0.6 }}>
                                        <input
                                            type="radio"
                                            name="collegeFilter"
                                            checked={sameCollegeOnly}
                                            onChange={() => handleCollegeFilterChange(true)}
                                            disabled={!user || !user.college}
                                        />
                                        My College Products
                                    </label>
                                </div>
                                {!user && (
                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Login to enable this filter.</div>
                                )}
                                {user && !user.college && (
                                    <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>Add your college in profile to enable.</div>
                                )}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Price Range</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="number" 
                                        placeholder="Min" 
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Max" 
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Condition</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {['New', 'Used'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setCondition(condition === c ? '' : c)}
                                            style={{ 
                                                flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--border)',
                                                background: condition === c ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                color: 'white'
                                            }}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Sort By</label>
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px' }}
                                >
                                    <option value="latest">Latest</option>
                                    <option value="priceLow">Price: Low to High</option>
                                    <option value="priceHigh">Price: High to Low</option>
                                </select>
                            </div>
                        </motion.aside>
                    )}

                    <div>
                        {!showFilters && (
                            <div style={{ marginBottom: '30px', background: 'var(--glass)', padding: '15px', borderRadius: '15px', border: '1px solid var(--border)', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search for anything..." 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 12px 12px 45px', outline: 'none' }}
                                    />
                                </div>
                                <select 
                                    value={category} 
                                    onChange={(e) => setCategory(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 20px', outline: 'none' }}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
                            <AnimatePresence mode='popLayout'>
                                {loading ? (
                                    [...Array(8)].map((_, i) => (
                                        <div key={i} className="card">
                                            <Skeleton height="200px" style={{ marginBottom: '15px' }} />
                                            <Skeleton width="80%" height="24px" style={{ marginBottom: '10px' }} />
                                            <Skeleton width="40%" height="28px" />
                                        </div>
                                    ))
                                ) : products.filter(p => p.isAvailable).length > 0 ? (
                                    products.filter(p => p.isAvailable).map(product => (
                                        <motion.div 
                                            key={product._id} 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -5 }}
                                            className="card"
                                            onClick={() => handleViewProduct(product._id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div style={{ height: '200px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '15px', overflow: 'hidden', position: 'relative' }}>
                                                {product.images?.[0] ? (
                                                    <Link to={`/products/${product._id}`} style={{ display: 'block', height: '100%' }}>
                                                        <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${product.images[0]}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </Link>
                                                ) : (
                                                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>No Image</div>
                                                )}
                                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 1 }}>
                                                    {product.category}
                                                </div>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishlist(product._id);
                                                    }}
                                                    style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: wishlist.includes(product._id) ? '#ef4444' : 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', zIndex: 1 }}
                                                >
                                                    <Heart size={20} fill={wishlist.includes(product._id) ? '#ef4444' : 'none'} />
                                                </button>
                                            </div>
                                            <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: '600' }}>{product.title}</h3>
                                            </Link>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                    {product.sellerId?.name?.[0]}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{product.sellerId?.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{formatCurrency(product.price)}</span>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button 
                                                        className="btn-primary" 
                                                        style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(product);
                                                        }}
                                                    >
                                                        <ShoppingCart size={16} /> Add to Cart
                                                    </button>
                                                    <button
                                                        className="btn-secondary"
                                                        style={{ padding: '8px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleChatWithSeller(product);
                                                        }}
                                                    >
                                                        <MessageCircle size={16} /> Chat
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px' }}>
                                        <div style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>No products found matching your criteria.</div>
                                        <button onClick={() => { setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setCondition(''); setSameCollegeOnly(false); }} className="btn-secondary">Clear All Filters</button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '50px' }}>
                                <button 
                                    disabled={page === 1} 
                                    onClick={() => setPage(page - 1)}
                                    style={{ background: 'var(--glass)', border: '1px solid var(--border)', color: 'white', padding: '10px', borderRadius: '50%', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <span style={{ fontWeight: 'bold' }}>Page {page} of {totalPages}</span>
                                <button 
                                    disabled={page === totalPages} 
                                    onClick={() => setPage(page + 1)}
                                    style={{ background: 'var(--glass)', border: '1px solid var(--border)', color: 'white', padding: '10px', borderRadius: '50%', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Products;
