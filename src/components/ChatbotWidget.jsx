import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Mic, Sparkles } from 'lucide-react';
import { buildMediaUrl } from '../utils/mediaUrl';

const initialMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Hi! I am your Campus Bazaar assistant. Ask me to find products, post listings, or solve account issues.'
  }
];

const buildHistoryPayload = (messages) =>
  messages
    .map((msg) => ({ role: msg.role, content: msg.content }))
    .filter((msg) => msg.role && msg.content)
    .slice(-8);

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState(
    () => localStorage.getItem('campus_bazaar_chat_id') || ''
  );

  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  const serverUrl = useMemo(() => {
    const base = import.meta.env.VITE_SERVER_URL || '';
    return base.replace(/\/$/, '');
  }, []);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, loading, isOpen]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };

    recognition.onerror = () => {
      setError('Voice input failed. Please try again.');
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');
    setLoading(true);

    const history = buildHistoryPayload(messages);

    try {
      const res = await axios.post('/api/chat', {
        message: trimmed,
        history,
        conversationId: conversationId || undefined
      });

      const { reply, products, conversationId: newConversationId } = res.data || {};

      if (newConversationId && newConversationId !== conversationId) {
        setConversationId(newConversationId);
        localStorage.setItem('campus_bazaar_chat_id', newConversationId);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: reply || 'Thanks for your message! How else can I help?',
          products: Array.isArray(products) ? products : []
        }
      ]);
    } catch (err) {
      const fallback = 'Sorry, I could not reach the assistant. Please try again in a moment.';
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', content: fallback }
      ]);
      setError('Network issue. Please retry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      setError('Voice input is not supported in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    setError('');
    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-glow transition hover:scale-105"
        aria-label="Open chat assistant"
      >
        <MessageCircle size={24} />
      </button>

      <div
        className={`fixed z-50 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
        } inset-0 md:inset-auto md:bottom-6 md:right-6 md:h-[560px] md:w-[380px]`}
      >
        <div className="flex h-full flex-col overflow-hidden border border-white/10 bg-slate-950/90 backdrop-blur-xl md:rounded-2xl shadow-2xl">
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="flex items-center gap-2 text-white">
                <Sparkles size={16} className="text-indigo-300" />
                <span className="text-sm font-semibold">Campus Bazaar Assistant</span>
              </div>
              <p className="text-xs text-slate-400">Online · Ready to help</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-slate-300 hover:bg-white/10"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end text-right' : ''}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed shadow ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/10 text-slate-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.products?.length ? (
                    <div className="space-y-2">
                      {msg.products.map((product) => (
                        <div
                          key={product._id}
                          className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200"
                        >
                          {product.image ? (
                            <img
                              src={buildMediaUrl(product.image, serverUrl)}
                              alt={product.title}
                              className="h-12 w-12 rounded-lg object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-[10px] text-slate-400">
                              No Image
                            </div>
                          )}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-sm font-semibold text-white">{product.title}</span>
                              <span className="text-sm font-semibold text-indigo-300">INR {product.price}</span>
                            </div>
                            <p className="text-[11px] text-slate-300">{product.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-xs text-slate-200">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-300" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-200" style={{ animationDelay: '100ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-100" style={{ animationDelay: '200ms' }} />
                  <span>Typing…</span>
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-white/10 px-4 py-3">
            {error ? <p className="mb-2 text-xs text-rose-300">{error}</p> : null}
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about buying, selling, or products..."
                className="flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={`rounded-full p-2 transition ${
                  listening ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
                aria-label="Voice input"
              >
                <Mic size={18} />
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="rounded-full bg-indigo-500 p-2 text-white shadow transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatbotWidget;
