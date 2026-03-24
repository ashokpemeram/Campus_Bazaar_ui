import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Upload, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

const createSuggestRequestId = () => {
    if (typeof window !== 'undefined') {
        const uuid = window.crypto?.randomUUID?.();
        if (uuid) return uuid;
    }
    return `sp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const AddProduct = () => {
    const [formData, setFormData] = useState({
        title: '', description: '', price: '', category: '', condition: 'New', originalPrice: ''
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState(null);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [suggestError, setSuggestError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setImages([...e.target.files]);
    };

    useEffect(() => {
        setSuggestion(null);
        setSuggestError('');
    }, [formData.title, formData.description, formData.category, formData.condition, formData.originalPrice]);

    const handleSuggestPrice = async () => {
        const requestId = createSuggestRequestId();
        console.log('[SuggestPrice]', requestId, 'clicked');
        setSuggestError('');
        setSuggestion(null);

        if (!formData.title || !formData.description || !formData.category || !formData.condition) {
            console.warn('[SuggestPrice]', requestId, 'validation failed', {
                title: Boolean(formData.title),
                description: Boolean(formData.description),
                category: Boolean(formData.category),
                condition: Boolean(formData.condition)
            });
            setSuggestError('Please fill title, description, category, and condition first.');
            return;
        }

        setSuggestLoading(true);
        const startedAt = Date.now();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                condition: formData.condition
            };
            const originalPriceValue = Number(formData.originalPrice);
            if (Number.isFinite(originalPriceValue) && originalPriceValue > 0) {
                payload.originalPrice = originalPriceValue;
            }
            console.log('[SuggestPrice]', requestId, 'sending request', {
                title: payload.title,
                category: payload.category,
                condition: payload.condition,
                descriptionLen: payload.description?.length || 0,
                originalPrice: payload.originalPrice ?? null
            });
            const res = await axios.post('/api/ai/suggest-price', payload, {
                headers: { 'x-request-id': requestId }
            });
            console.log('[SuggestPrice]', requestId, 'response', {
                status: res.status,
                durationMs: Date.now() - startedAt,
                suggestedPrice: res.data?.suggestedPrice,
                minPrice: res.data?.minPrice,
                maxPrice: res.data?.maxPrice,
                confidence: res.data?.confidence
            });
            setSuggestion(res.data);
        } catch (err) {
            console.error('[SuggestPrice]', requestId, 'error', {
                status: err.response?.status,
                message: err.response?.data?.message || err.message
            });
            setSuggestError(err.response?.data?.message || 'Failed to get price suggestion');
        } finally {
            console.log('[SuggestPrice]', requestId, 'done', {
                durationMs: Date.now() - startedAt
            });
            setSuggestLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'originalPrice') return;
            data.append(key, formData[key]);
        });
        images.forEach(image => data.append('images', image));

        try {
            await axios.post('/api/products', data);
            alert('Product listed successfully! It is now pending admin approval.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to list product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a' }}>
            <Navbar />
            <div className="container" style={{ maxWidth: '800px', padding: '40px 20px' }}>
                <div className="glass animate-fade" style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                        <ShoppingBag className="gradient-text" size={32} />
                        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>List Your <span className="gradient-text">Product</span></h1>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Product Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="glass" 
                                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--border)', outline: 'none' }}
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Category</label>
                                <select 
                                    className="glass" 
                                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--border)', outline: 'none' }}
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Books">Books</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Dorm Essentials">Dorm Essentials</option>
                                    <option value="Tools">Tools</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Price (INR)</label>
                                <input 
                                    type="number" 
                                    required 
                                    min="0"
                                    className="glass" 
                                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--border)', outline: 'none' }}
                                    value={formData.price}
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                />
                                <button
                                    type="button"
                                    onClick={handleSuggestPrice}
                                    disabled={suggestLoading}
                                    style={{ marginTop: '10px', padding: '10px 12px', background: 'transparent', border: '1px solid var(--border)', color: 'white', width: '100%' }}
                                >
                                    {suggestLoading ? 'Suggesting...' : 'Suggest Price'}
                                </button>
                                {suggestError && (
                                    <div style={{ marginTop: '10px', color: '#f43f5e', fontSize: '0.9rem' }}>
                                        {suggestError}
                                    </div>
                                )}
                                {suggestion && (
                                    <div style={{ marginTop: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
                                        <div style={{ fontWeight: '600', marginBottom: '6px' }}>Suggested Price: INR {suggestion.suggestedPrice}</div>
                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Range: INR {suggestion.minPrice} - INR {suggestion.maxPrice}</div>
                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '6px' }}>{suggestion.reason}</div>
                                        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '6px' }}>
                                            Confidence: {suggestion.confidence || 'Low'}
                                        </div>
                                        {suggestion.conditionApplied && suggestion.depreciationPercent && (
                                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '6px' }}>
                                                Condition: {suggestion.conditionApplied} ({suggestion.depreciationPercent} of original price)
                                            </div>
                                        )}
                                        {suggestion.breakdown && (
                                            <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '8px' }}>
                                                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Based on</div>
                                                {suggestion.breakdown.depreciatedPrice ? (
                                                    <div>Condition adjusted price: INR {suggestion.breakdown.depreciatedPrice}</div>
                                                ) : null}
                                                {suggestion.breakdown.avgMarketPrice ? (
                                                    <div>Similar listings: INR {Math.round(suggestion.breakdown.avgMarketPrice)}</div>
                                                ) : null}
                                                {suggestion.breakdown.originalPrice ? (
                                                    <div>Original Price: INR {suggestion.breakdown.originalPrice}</div>
                                                ) : null}
                                                {suggestion.breakdown.aiUsed ? (
                                                    <div>AI estimate used due to limited data</div>
                                                ) : null}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, price: suggestion.suggestedPrice })}
                                            style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--primary)', color: 'white', border: 'none', width: '100%' }}
                                        >
                                            Use This Price
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Original Price (Optional)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="glass"
                                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--border)', outline: 'none' }}
                                    value={formData.originalPrice}
                                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Condition</label>
                                <select 
                                    className="glass" 
                                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--border)', outline: 'none' }}
                                    value={formData.condition}
                                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                                    required
                                >
                                    <option value="New">New</option>
                                    <option value="Like New">Like New</option>
                                    <option value="Good">Good</option>
                                    <option value="Used">Used</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Poor">Poor</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Description</label>
                                <textarea 
                                    rows="4" 
                                    required 
                                    className="glass" 
                                    style={{ width: '100%', padding: '12px', color: 'white', border: '1px solid var(--border)', outline: 'none', resize: 'none' }}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Product Images</label>
                                <div style={{ position: 'relative', border: '2px dashed var(--border)', borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer' }}>
                                    <Upload style={{ color: 'var(--primary)', marginBottom: '10px' }} size={40} />
                                    <p style={{ color: 'var(--text-dim)' }}>Click to upload up to 5 images</p>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                    />
                                    {images.length > 0 && (
                                        <div style={{ marginTop: '15px', color: 'var(--primary)', fontWeight: 'bold' }}>
                                            {images.length} files selected
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', fontSize: '1.1rem', marginTop: '20px' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'List Product for Approval'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
