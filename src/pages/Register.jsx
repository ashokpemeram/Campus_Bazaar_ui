import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, School, Loader2 } from 'lucide-react';
import { allowedDomains } from '../config/collegeDomains';
import { resolveCollegeName } from '../utils/collegeResolver';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [collegeName, setCollegeName] = useState('');
    const [isFallback, setIsFallback] = useState(false);
    const [collegeConfirmed, setCollegeConfirmed] = useState(false);
    const [isEditingCollege, setIsEditingCollege] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const getEmailDomain = (email) => {
        const parts = (email || '').toLowerCase().trim().split('@');
        return parts.length === 2 ? parts[1] : '';
    };

    const emailDomain = getEmailDomain(formData.email);
    const isCollegeEmail = !!emailDomain && allowedDomains.includes(emailDomain);
    const emailError = formData.email && !isCollegeEmail
        ? 'Please use your college email (e.g., name@college.edu)'
        : '';

    useEffect(() => {
        if (!emailDomain || !isCollegeEmail) {
            setCollegeName('');
            setIsFallback(false);
            setCollegeConfirmed(false);
            setIsEditingCollege(false);
            return;
        }

        const detected = resolveCollegeName(emailDomain);
        setCollegeName(detected.collegeName);
        setIsFallback(detected.isFallback);
        setCollegeConfirmed(!detected.isFallback);
        setIsEditingCollege(false);
    }, [emailDomain, isCollegeEmail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isCollegeEmail) {
            setError('Please use your college email (e.g., name@college.edu)');
            return;
        }
        if (isFallback && !collegeConfirmed) {
            setError('Please confirm your detected college name');
            return;
        }
        if (isFallback && !collegeName.trim()) {
            setError('Please provide a valid college name');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await register({
                ...formData,
                collegeName: collegeName.trim(),
                collegeConfirmed: isFallback ? collegeConfirmed : false
            });
            navigate('/verify-email', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="glass animate-fade" style={{ padding: '40px', width: '100%', maxWidth: '450px' }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '10px', textAlign: 'center' }}>Join Campus Bazaar</h1>
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: '30px' }}>Create an account to start trading</p>
                
                {error && <div style={{ color: 'var(--accent)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <User size={18} style={{ color: 'var(--text-dim)', marginRight: '10px' }} />
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Mail size={18} style={{ color: 'var(--text-dim)', marginRight: '10px' }} />
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                        {emailError && <div style={{ color: 'var(--accent)', marginTop: '8px', fontSize: '0.9rem' }}>{emailError}</div>}
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <School size={18} style={{ color: 'var(--text-dim)', marginRight: '10px' }} />
                            <input
                                type="text"
                                placeholder="Detected College"
                                value={collegeName}
                                onChange={(e) => setCollegeName(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                readOnly={!isFallback || !isEditingCollege}
                            />
                        </div>
                        {isFallback && (
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Is this correct?</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCollegeConfirmed(true);
                                        setIsEditingCollege(false);
                                    }}
                                    style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px' }}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCollegeConfirmed(true);
                                        setIsEditingCollege(true);
                                    }}
                                    style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '6px' }}
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Lock size={18} style={{ color: 'var(--text-dim)', marginRight: '10px' }} />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={formData.password} 
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading || !isCollegeEmail || (isFallback && (!collegeConfirmed || !collegeName.trim()))}
                        style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
