import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';

const CurrentListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentListings = async () => {
            try {
                const res = await axios.get('/api/products/my', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                // Filter only approved ones for "Current Listings"
                setListings(res.data.filter(l => l.status === 'approved'));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentListings();
    }, []);

    if (loading) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>{[...Array(4)].map((_, i) => <Skeleton key={i} height="250px" />)}</div>;

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>Current Active Listings</h2>

            {listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-dim)' }}>
                    No active listings at the moment.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                    {listings.map(product => (
                        <div key={product._id} className="card" style={{ padding: '15px' }}>
                            <div style={{ height: '140px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginBottom: '12px', overflow: 'hidden' }}>
                                {product.images?.[0] ? <img src={`${import.meta.env.VITE_SERVER_URL}/uploads/${product.images[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                            </div>
                            <h4 style={{ fontSize: '1rem', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</h4>
                            <div style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '10px' }}>{formatCurrency(product.price)}</div>
                            <Link to={`/products/${product._id}`} className="btn-secondary" style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '8px', fontSize: '0.8rem' }}>View Live</Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CurrentListings;
