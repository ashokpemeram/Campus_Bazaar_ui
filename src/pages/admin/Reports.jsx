import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { Flag, AlertTriangle, CheckCircle } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get('/api/admin/reports');
                setReports(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchReports();
    }, []);

    return (
        <AdminLayout title="Moderation Reports">
            <div style={{ display: 'grid', gap: '20px' }}>
                {reports.length > 0 ? reports.map(report => (
                    <div key={report._id} className="card glass animate-fade" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Flag color="#f43f5e" size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>{report.targetType.toUpperCase()} Report</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                    Reason: <span style={{ color: 'white' }}>{report.reason}</span> • Reported by: {report.reportedBy?.name}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button style={{ background: 'var(--primary)', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} /> Review
                            </button>
                            <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '10px 20px' }}>
                                Dismiss
                            </button>
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-dim)' }}>
                        <CheckCircle size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
                        <p>No pending reports. Great job!</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Reports;
