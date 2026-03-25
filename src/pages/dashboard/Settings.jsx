import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Camera, Save, Lock } from 'lucide-react';
import { validateName, validatePassword } from '../../utils/validation';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const collegeName = user?.collegeName || user?.college || '';
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(user?.avatar ? `${import.meta.env.VITE_SERVER_URL}/uploads/${user.avatar}` : null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const nameError = name && !validateName(name) ? 'Name must contain only letters' : '';
    const newPasswordError = newPassword && !validatePassword(newPassword)
        ? 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        : '';

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!validateName(name)) {
            setMessage({ type: 'error', text: 'Name must contain only letters' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('name', name);
        if (avatar) formData.append('avatar', avatar);

        try {
            const res = await axios.put('/api/auth/update-profile', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}` 
                }
            });
            // Update context
            updateUser({ ...user, ...res.data.user });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            const apiError = err.response?.data?.errors?.[0]?.msg;
            setMessage({ type: 'error', text: apiError || err.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!oldPassword) {
            setPasswordMessage({ type: 'error', text: 'Old password is required' });
            return;
        }
        if (!validatePassword(newPassword)) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' });
            return;
        }
        setPasswordLoading(true);
        setPasswordMessage({ type: '', text: '' });
        try {
            await axios.post('/api/auth/change-password', { oldPassword, newPassword }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPasswordMessage({ type: 'success', text: 'Password updated successfully' });
            setOldPassword('');
            setNewPassword('');
        } catch (err) {
            const apiError = err.response?.data?.errors?.[0]?.msg;
            setPasswordMessage({ type: 'error', text: apiError || err.response?.data?.message || 'Password update failed' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Profile Settings</h2>

            {message.text && (
                <div style={{ 
                    padding: '15px', borderRadius: '10px', marginBottom: '20px',
                    background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#22c55e' : '#ef4444',
                    border: `1px solid ${message.type === 'success' ? '#22c55e33' : '#ef444433'}`
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px solid var(--primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {preview ? <img src={preview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={50} style={{ color: 'var(--text-dim)' }} />}
                        </div>
                        <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-dark)' }}>
                            <Camera size={16} />
                            <input type="file" onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
                        </label>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                setName(value);
                            }}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }}
                        />
                        {nameError && <div style={{ marginTop: '8px', color: 'var(--accent)', fontSize: '0.85rem' }}>{nameError}</div>}
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>College / University</label>
                        <input 
                            type="text" 
                            value={collegeName}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }}
                            readOnly
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || Boolean(nameError)}
                    className="btn-primary" 
                    style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold' }}
                >
                    <Save size={20} /> {loading ? 'Updating...' : 'Save Changes'}
                </button>
            </form>

            <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Change Password</h3>
                {passwordMessage.text && (
                    <div style={{ 
                        padding: '12px', borderRadius: '10px', marginBottom: '16px',
                        background: passwordMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: passwordMessage.type === 'success' ? '#22c55e' : '#ef4444',
                        border: `1px solid ${passwordMessage.type === 'success' ? '#22c55e33' : '#ef444433'}`
                    }}>
                        {passwordMessage.text}
                    </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Old Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="********"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }}
                            />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="********"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }}
                            />
                        </div>
                        {newPasswordError && <div style={{ marginTop: '8px', color: 'var(--accent)', fontSize: '0.85rem' }}>{newPasswordError}</div>}
                    </div>
                    <button
                        type="submit"
                        disabled={passwordLoading || Boolean(newPasswordError)}
                        className="btn-secondary"
                        style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold' }}
                    >
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
