import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children, title }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: Package, label: 'Products', path: '/admin/products' },
        { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' }
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e' }}>
            {/* Sidebar */}
            <aside className="glass" style={{ width: '280px', margin: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package color="white" size={24} />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>Admin<span className="gradient-text">Panel</span></span>
                </div>

                <nav style={{ flex: 1, padding: '0 15px' }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    padding: '14px 20px', 
                                    textDecoration: 'none', 
                                    color: isActive ? 'white' : 'var(--text-dim)',
                                    background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    borderRadius: '12px',
                                    marginBottom: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={20} style={{ color: isActive ? 'var(--primary)' : 'inherit' }} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '20px' }}>
                    <button 
                        onClick={() => { logout(); navigate('/login'); }}
                        style={{ width: '100%', padding: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                    <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '15px', color: 'var(--text-dim)', fontSize: '0.8rem', textDecoration: 'none' }}>
                        <ChevronLeft size={14} style={{ verticalAlign: 'middle' }} /> Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px 40px 40px 20px', overflowY: 'auto' }}>
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>{title}</h1>
                    <div style={{ color: 'var(--text-dim)' }}>
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
