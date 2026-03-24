import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const OrderSuccess = () => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
            <Navbar />
            <div className="container" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
                <div className="card animate-fade" style={{ maxWidth: '600px', width: '100%', padding: '60px 40px', textAlign: 'center' }}>
                    <div style={{ width: '100px', height: '100px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' }}>
                        <CheckCircle size={50} style={{ color: '#22c55e' }} />
                    </div>
                    
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>Order Confirmed!</h1>
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>
                        Thank you for your purchase. Your order has been placed successfully and the seller has been notified. You can track your order status in the dashboard.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Link to="/dashboard/orders" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px' }}>
                            <Package size={20} /> View Orders
                        </Link>
                        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px' }}>
                            <Home size={20} /> Back Home <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
