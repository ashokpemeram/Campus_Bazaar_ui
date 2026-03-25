import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { Search, UserMinus, ShieldCheck, Trash2 } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avatarErrors, setAvatarErrors] = useState({});

    const getAvatarUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
        return `${import.meta.env.VITE_SERVER_URL}/uploads/${avatar}`;
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const blockUser = async (id) => {
        if (!confirm('Are you sure you want to block this user?')) return;
        try {
            await axios.patch(`/api/admin/users/${id}/block`);
            fetchUsers();
        } catch (err) {
            alert('Failed to block user');
        }
    };

    const unblockUser = async (id) => {
        if (!confirm('Unblock this user?')) return;
        try {
            await axios.put(`/api/admin/users/${id}/unblock`);
            fetchUsers();
        } catch (err) {
            alert('Failed to unblock user');
        }
    };

    const deleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user? This action is permanent!')) return;
        try {
            await axios.delete(`/api/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    return (
        <AdminLayout title="User Management">
            <div className="card glass" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px', width: '300px' }}>
                        <Search size={18} style={{ color: 'var(--text-dim)' }} />
                        <input type="text" placeholder="Search by name or email..." style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%' }} />
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>User</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>College</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Role</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Status</th>
                            <th style={{ padding: '15px 20px', color: 'var(--text-dim)', fontWeight: '500' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '15px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', overflow: 'hidden' }}>
                                            {user.avatar && !avatarErrors[user._id] ? (
                                                <img
                                                    src={getAvatarUrl(user.avatar)}
                                                    alt={user.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={() => setAvatarErrors((prev) => ({ ...prev, [user._id]: true }))}
                                                />
                                            ) : (
                                                user.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '15px 20px' }}>{user.college}</td>
                                <td style={{ padding: '15px 20px' }}>
                                    <span style={{ fontSize: '0.8rem', background: user.role === 'admin' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)', color: user.role === 'admin' ? 'var(--primary)' : 'inherit', padding: '4px 8px', borderRadius: '4px' }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '15px 20px' }}>
                                    <span style={{ color: user.isBlocked ? '#f43f5e' : '#10b981', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </td>
                                <td style={{ padding: '15px 20px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {!user.isBlocked && user.role !== 'admin' && (
                                            <button onClick={() => blockUser(user._id)} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '6px' }} title="Block User">
                                                <UserMinus size={16} />
                                            </button>
                                        )}
                                        {user.isBlocked && (
                                            <button onClick={() => unblockUser(user._id)} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px' }} title="Unblock User">
                                                <ShieldCheck size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => deleteUser(user._id)} style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-dim)', padding: '6px' }} title="Delete User">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default Users;
