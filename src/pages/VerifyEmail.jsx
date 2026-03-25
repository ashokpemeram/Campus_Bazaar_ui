import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { allowedDomains } from '../config/collegeDomains';

const VerifyEmail = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();

    const getEmailDomain = (value) => {
        const parts = (value || '').toLowerCase().trim().split('@');
        return parts.length === 2 ? parts[1] : '';
    };

    const emailDomain = getEmailDomain(email);
    const isCollegeEmail = !!emailDomain && allowedDomains.includes(emailDomain);
    const emailError = email && !isCollegeEmail
        ? 'Please use your college email (e.g., name@college.edu)'
        : '';

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email || !email.trim()) {
            setError('Email is required');
            return;
        }
        if (!isCollegeEmail) {
            setError('Please use your college email (e.g., name@college.edu)');
            return;
        }
        if (!otp) {
            setError('OTP is required');
            return;
        }

        setLoading(true);
        try {
            const res = await verifyOtp(email, otp);
            if (res.status === 200) {
                setMessage(res.data?.message || 'OTP verified successfully');
                alert('OTP verified');
                navigate('/login');
            }
            setOtp('');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setMessage('');
        if (!isCollegeEmail) {
            setError('Please use your college email (e.g., name@college.edu)');
            return;
        }
        setResending(true);
        try {
            const res = await resendOtp(email);
            setMessage(res.message || 'OTP resent to your college email');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="glass animate-fade" style={{ padding: '40px', width: '100%', maxWidth: '450px' }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '10px', textAlign: 'center' }}>Verify Your Email</h1>
                <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginBottom: '30px' }}>Enter the OTP sent to your college email</p>

                {error && <div style={{ color: 'var(--accent)', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
                {message && <div style={{ color: 'var(--primary)', marginBottom: '20px', textAlign: 'center' }}>{message}</div>}

                <form onSubmit={handleVerify} noValidate>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Mail size={18} style={{ color: 'var(--text-dim)', marginRight: '10px' }} />
                            <input
                                type="email"
                                placeholder="College Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                        {emailError && <div style={{ color: 'var(--accent)', marginTop: '8px', fontSize: '0.9rem' }}>{emailError}</div>}
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <Lock size={18} style={{ color: 'var(--text-dim)', marginRight: '10px' }} />
                            <input
                                type="text"
                                placeholder="OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !isCollegeEmail}
                        style={{ width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Verify Email'}
                    </button>
                </form>

                <button
                    onClick={handleResend}
                    disabled={resending || !isCollegeEmail}
                    style={{ width: '100%', marginTop: '12px', padding: '12px', background: 'transparent', border: '1px solid var(--border)', color: 'white' }}
                >
                    {resending ? 'Resending...' : 'Resend OTP'}
                </button>

                <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                    Back to <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
