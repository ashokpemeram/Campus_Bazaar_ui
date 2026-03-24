import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Camera, Save, Lock } from 'lucide-react';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const collegeName = user?.collegeName || user?.college || '';
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(user?.avatar ? `${import.meta.env.VITE_SERVER_URL}/uploads/${user.avatar}` : null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('name', name);
        if (password) formData.append('password', password);
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
            setPassword('');
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
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
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }}
                        />
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
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>New Password (leave blank to keep current)</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '10px', color: 'white' }}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary" 
                    style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold' }}
                >
                    <Save size={20} /> {loading ? 'Updating...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default Settings;
