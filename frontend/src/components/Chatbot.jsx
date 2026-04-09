import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { getSocket } from '../services/socket.js';

const starterReplies = [
  { label: 'Show mobiles', value: 'Show mobile phones' },
  { label: 'Post item', value: 'How do I post a product?' },
  { label: 'Pricing help', value: 'How should I price my item?' },
  { label: 'Go dashboard', value: 'Where is my dashboard?' }
];

const formatTime = (value) => new Date(value || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Chatbot() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const socket = getSocket(token);

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
    socket.emit('chatbot:send_message', { text: cleanText }, (response) => {
      if (!response?.ok) setError(response?.error || 'Could not send message.');
    });
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
        <section className="mb-4 flex h-[34rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-slate-950 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-brand-500 p-2">
                <Bot size={18} />
              </div>
              <div>
                <p className="font-black">LoopBot</p>
                <p className="text-xs text-slate-300">{typing ? 'typing...' : 'MarketLoop AI assistant'}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chatbot">
              <X size={18} />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-auto bg-slate-50 p-4">
            {!messages.length && (
              <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                <p className="font-bold text-slate-900">Hi {user.name}, I am LoopBot.</p>
                <p className="mt-1">Ask me to find products, help you post an item, explain pricing, or navigate MarketLoop.</p>
              </div>
            )}

            {messages.map((message, index) => {
              const mine = message.sender === 'user';
              return (
                <div key={`${message.timestamp}-${index}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${mine ? 'bg-brand-600 text-white' : 'bg-white text-slate-800'}`}>
                    <p>{message.text}</p>
                    {!!message.products?.length && (
                      <div className="mt-3 space-y-2">
                        {message.products.map((product) => (
                          <Link key={product._id} to={`/products/${product._id}`} className="block rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800">
                            <p className="font-bold">{product.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{product.category} | {product.location}</p>
                            <p className="mt-1 font-black text-brand-700">Rs {Number(product.price || 0).toLocaleString('en-IN')}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                    {!!message.quickReplies?.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.quickReplies.map((reply) => (
                          <button
                            key={reply.value}
                            onClick={() => sendMessage(reply.value)}
                            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                          >
                            {reply.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className={`mt-1 text-[10px] ${mine ? 'text-cyan-100' : 'text-slate-400'}`}>{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">LoopBot is typing...</div>
              </div>
            )}
            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto">
              {starterReplies.map((reply) => (
                <button key={reply.value} className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600" onClick={() => sendMessage(reply.value)}>
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
