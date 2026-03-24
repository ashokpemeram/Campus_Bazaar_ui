import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [needsVerify, setNeedsVerify] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setNeedsVerify(false);
        try {
            const data = await login(email, password);
            if (data.user.role === 'admin') navigate('/admin');
            else navigate('/');
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            if (err.response?.status === 403 && message.toLowerCase().includes('verify')) {
                setNeedsVerify(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="glass animate-fade" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '10px', textAlign: 'center' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: '30px' }}>Sign in to continue to Campus Bazaar</p>
                
                {error && (
                    <div style={{ color: 'var(--accent)', marginBottom: '20px', textAlign: 'center' }}>
                        {error}
                        {needsVerify && (
                            <div style={{ marginTop: '8px' }}>
                                <Link to="/verify-email" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                    Verify your email
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Mail size={18} style={{ color: 'var(--text-dim)', marginRight: '10px' }} />
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Lock size={18} style={{ color: 'var(--text-dim)', marginRight: '10px' }} />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Login'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
