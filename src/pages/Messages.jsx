import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const Messages = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false));
    const socketRef = useRef(null);
    const selectedRef = useRef(null);
    const messagesEndRef = useRef(null);

    const draftConversation = useMemo(() => {
        const productId = searchParams.get('productId');
        const otherUserId = searchParams.get('userId');
        if (!productId || !otherUserId) return null;
        return {
            isDraft: true,
            productId,
            otherUserId,
            otherUserName: searchParams.get('name') || 'Seller',
            productTitle: searchParams.get('title') || 'Product'
        };
    }, [searchParams]);

    useEffect(() => {
        selectedRef.current = selected;
    }, [selected]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/api/messages/conversations', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setConversations(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const getConversationMeta = (conversation) => {
        if (!conversation) return {};
        if (conversation.isDraft) {
            return {
                productId: conversation.productId,
                otherUserId: conversation.otherUserId,
                otherUserName: conversation.otherUserName,
                productTitle: conversation.productTitle
            };
        }
        const productId = conversation.productId?._id || conversation.productId;
        const participants = conversation.participants || [];
        const otherUser = participants.find((p) => (p._id || p) !== user?.id);
        return {
            productId,
            otherUserId: otherUser?._id || otherUser,
            otherUserName: otherUser?.name || 'User',
            productTitle: conversation.productId?.title || 'Product'
        };
    };

    const isMessageForConversation = (msg, conversation) => {
        if (!msg || !conversation) return false;
        const { productId, otherUserId } = getConversationMeta(conversation);
        if (!productId || !otherUserId) return false;

        const messageProductId = msg.productId?._id || msg.productId;
        const senderId = msg.sender?._id || msg.sender;
        const receiverId = msg.receiver?._id || msg.receiver;
        const isBetweenUsers = [senderId, receiverId].includes(otherUserId);

        return String(messageProductId) === String(productId) && isBetweenUsers;
    };

    const isSameConversation = (a, b) => {
        if (!a || !b) return false;
        const metaA = getConversationMeta(a);
        const metaB = getConversationMeta(b);
        return String(metaA.productId) === String(metaB.productId) && String(metaA.otherUserId) === String(metaB.otherUserId);
    };

    const loadMessages = async (conversation) => {
        const { productId, otherUserId } = getConversationMeta(conversation);
        if (!productId || !otherUserId) return;
        try {
            const res = await axios.get(`/api/messages/${productId}/${otherUserId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (draftConversation) {
            setSelected(draftConversation);
            setMessages([]);
            loadMessages(draftConversation);
        }
    }, [draftConversation]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !user?.id) return;

        const socket = io(SOCKET_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on('receiveMessage', (msg) => {
            if (selectedRef.current && isMessageForConversation(msg, selectedRef.current)) {
                setMessages((prev) => [...prev, msg]);
            }
            fetchConversations();
        });

        socket.on('messageError', (err) => {
            console.error('Message error:', err);
        });

        return () => {
            socket.disconnect();
        };
    }, [user?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const displayConversations = useMemo(() => {
        if (!draftConversation) return conversations;
        const draftMeta = getConversationMeta(draftConversation);
        const exists = conversations.some((c) => {
            const meta = getConversationMeta(c);
            return String(meta.productId) === String(draftMeta.productId) && String(meta.otherUserId) === String(draftMeta.otherUserId);
        });
        if (exists) return conversations;
        return [draftConversation, ...conversations];
    }, [conversations, draftConversation]);

    const handleSelectConversation = async (conversation) => {
        setSelected(conversation);
        setMessages([]);
        await loadMessages(conversation);
    };

    const handleSend = () => {
        if (!text.trim() || !selected || !user?.id) return;
        const { productId, otherUserId } = getConversationMeta(selected);
        if (!productId || !otherUserId) return;

        socketRef.current?.emit('sendMessage', {
            sender: user.id,
            receiver: otherUserId,
            message: text.trim(),
            productId
        });
        setText('');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <Navbar />
            <div className="container" style={{ padding: '30px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: '20px' }}>
                    <div className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', height: 'calc(100vh - 180px)', overflow: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <MessageCircle size={20} className="gradient-text" />
                            <div style={{ fontWeight: '700' }}>Chats</div>
                        </div>
                        {displayConversations.length === 0 ? (
                            <div style={{ color: 'var(--text-dim)' }}>No conversations yet.</div>
                        ) : (
                            displayConversations.map((conversation) => {
                                const meta = getConversationMeta(conversation);
                                const isActive = selected && isSameConversation(conversation, selected);
                                return (
                                    <button
                                        key={`${meta.productId}-${meta.otherUserId}-${conversation.isDraft ? 'draft' : 'saved'}`}
                                        onClick={() => handleSelectConversation(conversation)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            marginBottom: '10px',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border)',
                                            background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                            color: 'white',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{meta.otherUserName}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{meta.productTitle}</div>
                                        {conversation.lastMessage ? (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                                                {conversation.lastMessage}
                                            </div>
                                        ) : null}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
                        {!selected ? (
                            <div style={{ color: 'var(--text-dim)' }}>Select a chat to start messaging.</div>
                        ) : (
                            <>
                                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '12px' }}>
                                    <div style={{ fontWeight: '700' }}>{getConversationMeta(selected).otherUserName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{getConversationMeta(selected).productTitle}</div>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                                    {messages.length === 0 ? (
                                        <div style={{ color: 'var(--text-dim)' }}>No messages yet. Say hello!</div>
                                    ) : (
                                        messages.map((msg) => {
                                            const senderId = msg.sender?._id || msg.sender;
                                            const isMine = senderId === user?.id;
                                            return (
                                                <div
                                                    key={msg._id}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                        marginBottom: '10px'
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            maxWidth: '70%',
                                                            padding: '10px 14px',
                                                            borderRadius: '14px',
                                                            background: isMine ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {msg.message}
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSend();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={handleSend}
                                        style={{
                                            background: 'var(--primary)',
                                            border: 'none',
                                            color: 'white',
                                            padding: '0 16px',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Send size={16} /> Send
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Messages;
