import { ShoppingBag, LogOut, LayoutDashboard, User as UserIcon, PlusCircle, Search, Heart, ShoppingCart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [wishCount, setWishCount] = useState(0);

    useEffect(() => {
        if (user) {
            const fetchCounts = async () => {
                try {
                    const cartRes = await axios.get('/api/cart', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setCartCount(cartRes.data.items?.length || 0);

                    const wishRes = await axios.get('/api/wishlist', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    setWishCount(wishRes.data?.length || 0);
                } catch (err) {
                    console.error('Error fetching counts:', err);
                }
            };
            fetchCounts();
            // Optional: Listen for storage events or custom events to update counts
            const handleUpdate = () => fetchCounts();
            window.addEventListener('cartUpdated', handleUpdate);
            window.addEventListener('wishlistUpdated', handleUpdate);
            return () => {
                window.removeEventListener('cartUpdated', handleUpdate);
                window.removeEventListener('wishlistUpdated', handleUpdate);
            };
        }
    }, [user]);

    return (
        <nav className="glass" style={{ margin: '20px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '20px', zIndex: 100 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                <ShoppingBag className="gradient-text" size={32} />
                <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-1px' }}>Campus<span className="gradient-text">Bazaar</span></span>
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/products" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Marketplace</Link>
                {user ? (
                    <>
                        <Link to="/wishlist" style={{ color: 'white', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Heart size={22} />
                            {wishCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishCount}</span>}
                        </Link>
                        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <ShoppingCart size={22} />
                            {cartCount > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--primary)', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
                        </Link>
                        <Link to="/messages" style={{ color: 'white', textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <MessageCircle size={22} />
                        </Link>
                        <Link to="/add-product" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px' }}>
                            <PlusCircle size={18} /> Sell
                        </Link>
                        <Link to="/dashboard" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                        {user.role === 'admin' && (
                            <Link to="/admin" style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}>Admin</Link>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user.avatar ? (
                                    <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${user.avatar}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <UserIcon size={16} />
                                )}
                            </div>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{user.name}</span>
                        </div>
                        <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                            <LogOut size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" style={{ background: 'var(--primary)', padding: '8px 20px', borderRadius: '8px', color: 'white', textDecoration: 'none', fontWeight: '600' }}>Join</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
