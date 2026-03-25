import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Package, ShoppingCart, IndianRupee, 
    Heart, MessageCircle, Settings, User as UserIcon, Menu, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

// Sub-pages (we'll implement them next)
import MyListings from './dashboard/MyListings';
import MyOrders from './dashboard/MyOrders';
import SellerOrders from './dashboard/SellerOrders';
import SoldProducts from './dashboard/SoldProducts';
import CurrentListings from './dashboard/CurrentListings';
import Wishlist from './dashboard/Wishlist';
import Messages from './dashboard/Messages';
import SettingsPage from './dashboard/Settings';

const Dashboard = () => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const menuItems = [
        { name: 'My Listings', icon: Package, path: '/dashboard/listings' },
        { name: 'Active Listings', icon: LayoutDashboard, path: '/dashboard/active' },
        { name: 'My Orders', icon: ShoppingCart, path: '/dashboard/orders' },
        { name: 'Seller Orders', icon: Package, path: '/dashboard/seller-orders' },
        { name: 'Sold Products', icon: IndianRupee, path: '/dashboard/sold' },
        { name: 'Wishlist', icon: Heart, path: '/dashboard/wishlist' },
        { name: 'Messages', icon: MessageCircle, path: '/dashboard/messages' },
        { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <Navbar />
            
            <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)', padding: '20px' }} className="container">
                {/* Sidebar */}
                <motion.aside 
                    initial={false}
                    animate={{ width: isSidebarOpen ? '280px' : '80px' }}
                    style={{ 
                        background: 'var(--glass)', 
                        borderRadius: '20px', 
                        border: '1px solid var(--border)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginRight: '20px',
                        overflow: 'hidden'
                    }}
                >
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ background: 'none', color: 'white', alignSelf: 'flex-end', padding: '5px' }}
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/dashboard/listings' && location.pathname === '/dashboard');
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                style={{ 
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    padding: '12px 15px',
                                    borderRadius: '12px',
                                    background: isActive ? 'var(--primary)' : 'transparent',
                                    color: 'white',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <item.icon size={20} style={{ minWidth: '20px' }} />
                                {isSidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.name}</span>}
                            </Link>
                        );
                    })}
                </motion.aside>

                {/* Main Content Area */}
                <main style={{ flex: 1, background: 'var(--glass)', borderRadius: '20px', border: '1px solid var(--border)', padding: '30px', overflowY: 'auto' }}>
                    <Routes>
                        <Route path="/" element={<MyListings />} />
                        <Route path="/listings" element={<MyListings />} />
                        <Route path="/active" element={<CurrentListings />} />
                        <Route path="/orders" element={<MyOrders />} />
                        <Route path="/seller-orders" element={<SellerOrders />} />
                        <Route path="/sold" element={<SoldProducts />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/messages" element={<Messages />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
