import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';
import PasswordInput from '../components/PasswordInput.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: 'admin@marketloop.test', password: 'Admin@123' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await login(form);
      const roles = data.user?.roles || (data.user?.role ? [data.user.role] : []);
      if (!roles.includes('admin')) {
        setError('This account does not have admin access.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <ShieldCheck size={16} /> Admin control center
      </div>
      <h1 className="text-3xl font-black">Admin login</h1>
      <p className="text-sm text-slate-500">Sign in as marketplace admin to manage operations, inventory, billing, and safety controls.</p>
      {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      <input className="input" type="email" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="btn w-full" disabled={loading}>{loading ? 'Signing in...' : 'Open admin panel'}</button>
      <p className="text-xs text-slate-500">Demo admin credentials are prefilled for local development. Change them after first login if needed.</p>
      <p className="text-sm text-slate-500">Need standard access instead? <Link className="font-semibold text-brand-700" to="/login">Use user login</Link></p>
    </form>
  );
}
