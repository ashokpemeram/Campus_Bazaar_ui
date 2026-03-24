import { MessageSquare } from 'lucide-react';

const Messages = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-dim)' }}>
            <div style={{ background: 'var(--glass)', padding: '30px', borderRadius: '50%', marginBottom: '20px' }}>
                <MessageSquare size={50} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'white' }}>Your Messages</h3>
            <p>Chat integration is coming soon! You can contact sellers directly from the product pages.</p>
        </div>
    );
};

export default Messages;
