import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const ChatbotQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await axios.get('/api/chat/admin/queries', { params: { limit: 80 } });
        setQueries(res.data?.queries || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  return (
    <AdminLayout title="Chatbot Queries">
      <div className="card glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Recent Conversations</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              Monitor what students ask the assistant to improve FAQs and listings.
            </p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-dim)' }}>Loading queries…</p>
        ) : queries.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No chatbot queries yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '14px' }}>
            {queries.map((item, idx) => (
              <div
                key={`${item.conversationId}-${idx}`}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {item.intent || 'general'}
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{item.message}</div>
                <div style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Conversation ID: {item.conversationId}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ChatbotQueries;
