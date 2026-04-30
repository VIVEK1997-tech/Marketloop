import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, MessageCircle, Send, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { formatLocation } from '../utils/location.js';

const starterReplies = [
  { label: 'Fresh fruits', value: 'Show fresh fruits available near me' },
  { label: 'Track orders', value: 'Show my recent order status' },
  { label: 'Sell item', value: 'How do I create a product listing?' },
  { label: 'Pricing', value: 'Help me decide a good selling price' }
];

const formatTime = (value) => new Date(value || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getPageType = (pathname) => {
  if (pathname.startsWith('/products/') && pathname.endsWith('/edit')) return 'product-edit';
  if (pathname.startsWith('/products/')) return 'product-details';
  if (pathname === '/products/new') return 'product-create';
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/wishlist') return 'wishlist';
  if (pathname === '/chat') return 'chat';
  if (pathname === '/payments') return 'payments';
  if (pathname === '/admin') return 'admin';
  return 'browse';
};

const getProductIdFromPath = (pathname) => {
  const match = pathname.match(/^\/products\/([^/]+)/);
  return match?.[1] || '';
};

const cleanSessionContext = (context) => Object.fromEntries(
  Object.entries(context).filter(([, value]) => value !== '' && value !== null && value !== undefined)
);

export default function Chatbot() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [feedbackState, setFeedbackState] = useState({});
  const bottomRef = useRef(null);
  const socket = getSocket(token);

  const sessionContext = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return cleanSessionContext({
      pageType: getPageType(location.pathname),
      currentPath: `${location.pathname}${location.search || ''}`,
      productId: getProductIdFromPath(location.pathname),
      orderId: params.get('orderId') || '',
      conversationId: location.pathname === '/chat' ? location.state?.conversationId || '' : '',
      searchQuery: params.get('q') || ''
    });
  }, [location.pathname, location.search, location.state]);

  useEffect(() => {
    if (!user || !open) return;
    api.get('/chatbot/history')
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => setError('Could not load chatbot history.'));
  }, [user, open]);

  useEffect(() => {
    if (!socket) return;

    const receiveMessage = ({ message }) => {
      setMessages((current) => [...current, message]);
    };
    const handleTyping = ({ isTyping }) => setTyping(isTyping);
    const handleError = ({ message }) => setError(message);

    socket.on('chatbot:receive_message', receiveMessage);
    socket.on('chatbot:typing', handleTyping);
    socket.on('chatbot:error', handleError);

    return () => {
      socket.off('chatbot:receive_message', receiveMessage);
      socket.off('chatbot:typing', handleTyping);
      socket.off('chatbot:error', handleError);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  const sendMessage = (messageText = text) => {
    const cleanText = messageText.trim();
    if (!cleanText || !socket) return;

    setError('');
    setText('');
    socket.emit('chatbot:send_message', { text: cleanText, context: sessionContext }, (response) => {
      if (!response?.ok) setError(response?.error || 'Could not send message.');
    });
  };

  const submitFeedback = async ({ interactionId, helpful }) => {
    if (!interactionId || feedbackState[interactionId]?.submitting) return;
    setFeedbackState((current) => ({
      ...current,
      [interactionId]: { helpful, submitting: true }
    }));

    try {
      await api.post('/chatbot/feedback', { interactionId, helpful });
      setMessages((current) => current.map((message) => (
        String(message.interactionId) === String(interactionId)
          ? {
              ...message,
              feedback: {
                helpful,
                submittedAt: new Date().toISOString()
              }
            }
          : message
      )));
      setFeedbackState((current) => ({
        ...current,
        [interactionId]: { helpful, submitting: false, saved: true }
      }));
    } catch {
      setFeedbackState((current) => ({
        ...current,
        [interactionId]: { ...current[interactionId], submitting: false, error: true }
      }));
      setError('Could not save chatbot feedback right now.');
    }
  };

  if (!user) {
    return (
      <Link
        to="/login"
        className="fixed bottom-6 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl transition hover:bg-brand-700"
        aria-label="Login to use AI assistant"
      >
        <Bot size={24} />
      </Link>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {open && (
        <section className="mb-4 flex h-[36rem] w-[24rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <header className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-brand-500 p-2">
                <Bot size={18} />
              </div>
              <div>
                <p className="font-black">LoopBot AI</p>
                <p className="text-xs text-slate-300">{typing ? 'thinking with live marketplace context...' : 'Context-aware MarketLoop assistant'}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chatbot">
              <X size={18} />
            </button>
          </header>

          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            Active context: <span className="font-semibold text-slate-700 dark:text-slate-200">{sessionContext.pageType.replace(/-/g, ' ')}</span>
            {sessionContext.productId && <span> | product aware</span>}
            {sessionContext.conversationId && <span> | chat aware</span>}
          </div>

          <div className="flex-1 space-y-3 overflow-auto bg-slate-50 p-4 dark:bg-slate-950">
            {!messages.length && (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-slate-100">Hi {user.name}, I am LoopBot.</p>
                <p className="mt-1">I can use your current page, recent orders, wishlist patterns, and chat history to give more relevant help.</p>
              </div>
            )}

            {messages.map((message, index) => {
              const mine = message.sender === 'user';
              const feedback = message.interactionId ? feedbackState[message.interactionId] : null;

              return (
                <div key={`${message.timestamp}-${index}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${mine ? 'bg-brand-600 text-white' : 'bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100'}`}>
                    <p>{message.text}</p>

                    {!mine && message.contextSummary && (
                      <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {message.contextSummary}
                      </p>
                    )}

                    {!!message.products?.length && (
                      <div className="mt-3 space-y-2">
                        {message.products.map((product) => (
                          <Link key={product._id} to={`/products/${product._id}`} className="block rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                            <p className="font-bold">{product.title}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{product.category} | {formatLocation(product.location, 'Local listing')}</p>
                            <p className="mt-1 font-black text-brand-700 dark:text-cyan-300">Rs {Number(product.price || 0).toLocaleString('en-IN')}</p>
                          </Link>
                        ))}
                      </div>
                    )}

                    {!!message.sources?.length && !mine && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.sources.map((source) => (
                          <span key={`${source.type}-${source.refId}-${source.label}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {source.type}: {source.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {!!message.quickReplies?.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.quickReplies.map((reply) => (
                          <button
                            key={reply.value}
                            onClick={() => sendMessage(reply.value)}
                            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-cyan-300"
                          >
                            {reply.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {!mine && message.interactionId && (
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="text-slate-400 dark:text-slate-500">Was this helpful?</span>
                        <button
                          type="button"
                          onClick={() => submitFeedback({ interactionId: message.interactionId, helpful: true })}
                          className={`rounded-full p-1.5 ${message.feedback?.helpful === true ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}
                          aria-label="Helpful response"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => submitFeedback({ interactionId: message.interactionId, helpful: false })}
                          className={`rounded-full p-1.5 ${message.feedback?.helpful === false ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}
                          aria-label="Not helpful response"
                        >
                          <ThumbsDown size={14} />
                        </button>
                        {feedback?.saved && <span className="text-emerald-600 dark:text-emerald-300">Saved</span>}
                      </div>
                    )}

                    <p className={`mt-1 text-[10px] ${mine ? 'text-cyan-100' : 'text-slate-400 dark:text-slate-500'}`}>{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">LoopBot is thinking through product, order, and chat context...</div>
              </div>
            )}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex gap-2 overflow-x-auto">
              {starterReplies.map((reply) => (
                <button key={reply.value} className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300" onClick={() => sendMessage(reply.value)}>
                  {reply.label}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
            >
              <input className="input py-2 text-sm" placeholder="Ask LoopBot..." value={text} onChange={(event) => setText(event.target.value)} />
              <button className="btn px-3 py-2" disabled={!text.trim()} aria-label="Send chatbot message">
                <Send size={17} />
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl transition hover:bg-brand-700"
        aria-label="Open AI assistant"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
