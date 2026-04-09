import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { getSocket } from '../services/socket.js';

export default function Chat() {
  const { state } = useLocation();
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(state?.conversationId || '');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const socket = useMemo(() => getSocket(token), [token]);

  useEffect(() => {
    api.get('/chats/conversations').then(({ data }) => {
      setConversations(data.conversations);
      if (!activeId && data.conversations[0]) setActiveId(data.conversations[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    api.get(`/chats/conversations/${activeId}/messages`).then(({ data }) => setMessages(data.messages));
    socket?.emit('joinConversation', { conversationId: activeId });
  }, [activeId, socket]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (message) => {
      if (message.conversation === activeId || message.conversation?._id === activeId) {
        setMessages((current) => [...current, message]);
      }
    };
    const onTyping = (payload) => {
      if (payload.conversationId === activeId && payload.userId !== user.id) setTyping(payload.isTyping);
    };
    socket.on('receiveMessage', onMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('receiveMessage', onMessage);
      socket.off('typing', onTyping);
    };
  }, [socket, activeId, user.id]);

  const send = (event) => {
    event.preventDefault();
    if (!text.trim() || !activeId) return;
    socket?.emit('sendMessage', { conversationId: activeId, message: text.trim() }, (response) => {
      if (response?.ok) setText('');
    });
  };

  const handleTyping = (event) => {
    setText(event.target.value);
    socket?.emit('typing', { conversationId: activeId, isTyping: Boolean(event.target.value) });
  };

  return (
    <div className="grid min-h-[75vh] gap-4 lg:grid-cols-[20rem_1fr]">
      <aside className="card space-y-3 overflow-auto">
        <h1 className="text-2xl font-black">Messages</h1>
        {conversations.map((conversation) => {
          const other = conversation.participants.find((participant) => participant._id !== user.id);
          return (
            <button
              key={conversation._id}
              className={`w-full rounded-xl p-3 text-left ${activeId === conversation._id ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-100'}`}
              onClick={() => setActiveId(conversation._id)}
            >
              <p className="font-bold">{other?.name || 'User'}</p>
              <p className="text-sm text-slate-500">{conversation.product?.title || conversation.lastMessage?.message || 'Start chatting'}</p>
            </button>
          );
        })}
        {!conversations.length && <p className="text-sm text-slate-500">Start a chat from any product details page.</p>}
      </aside>
      <section className="card flex flex-col p-0">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-xl font-black">Conversation</h2>
          {typing && <p className="text-sm text-brand-700">Typing...</p>}
        </div>
        <div className="flex-1 space-y-3 overflow-auto p-4">
          {messages.map((message) => {
            const mine = (message.sender?._id || message.sender) === user.id;
            return (
              <div key={message._id || `${message.createdAt}-${message.message}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  <p>{message.message}</p>
                  <p className="mt-1 text-xs opacity-70">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
          {!activeId && <p className="text-slate-500">Choose a conversation.</p>}
        </div>
        <form onSubmit={send} className="flex gap-3 border-t border-slate-200 p-4">
          <input className="input" value={text} onChange={handleTyping} placeholder="Type a message..." />
          <button className="btn gap-2" disabled={!activeId}><Send size={18} /> Send</button>
        </form>
      </section>
    </div>
  );
}
