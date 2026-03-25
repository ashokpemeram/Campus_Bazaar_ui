import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { Users, Package, ShoppingCart, IndianRupee, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        revenue: 0,
        activeUsers: 0,
        blockedUsers: 0,
        salesByDay: { labels: [], data: [] },
        growthPercent: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/api/admin/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const chartData = {
        labels: ['Active Users', 'Blocked Users'],
        datasets: [{
            data: [stats.activeUsers, stats.blockedUsers],
            backgroundColor: ['#6366f1', '#f43f5e'],
            borderWidth: 0
        }]
    };

    const fallbackLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesLabels = stats.salesByDay?.labels?.length ? stats.salesByDay.labels : fallbackLabels;
    const salesData = stats.salesByDay?.data?.length
        ? stats.salesByDay.data
        : new Array(salesLabels.length).fill(0);

    const lineData = {
        labels: salesLabels,
        datasets: [{
            label: 'Sales (INR)',
            data: salesData,
            borderColor: '#6366f1',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.1)'
        }]
    };

    const growthValue = Number.isFinite(stats.growthPercent) ? stats.growthPercent : 0;
    const growthIsPositive = growthValue >= 0;
    const growthLabel = `${growthIsPositive ? '+' : ''}${growthValue}% this week`;

    return (
        <AdminLayout title="System Overview">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#6366f1' },
                    { label: 'Live Products', value: stats.totalProducts, icon: Package, color: '#10b981' },
                    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: '#f59e0b' },
                    { label: 'Revenue', value: formatCurrency(stats.revenue), icon: IndianRupee, color: '#f43f5e' }
                ].map((stat, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', background: `${stat.color}20`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <stat.icon size={28} color={stat.color} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '4px' }}>{stat.label}</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div className="card glass">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Growth Analytics</h3>
                        <div style={{ color: growthIsPositive ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                            <TrendingUp size={16} /> {growthLabel}
                        </div>
                    </div>
                    <div style={{ height: '300px' }}>
                        <Line data={lineData} options={{ maintainAspectRatio: false, scales: { y: { display: false }, x: { grid: { display: false } } } }} />
                    </div>
                </div>

                <div className="card glass">
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '30px' }}>User Distribution</h3>
                    <div style={{ height: '220px', marginBottom: '20px' }}>
                        <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '12px', color: '#10b981', fontSize: '0.85rem' }}>
                        System health looks good.
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
