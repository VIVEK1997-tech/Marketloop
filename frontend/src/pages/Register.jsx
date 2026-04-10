import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';
import PasswordInput from '../components/PasswordInput.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'buyer' });

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await register(form);
      setMessage(response.message || 'OTP sent to email');
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-lg space-y-4">
      <h1 className="text-3xl font-black">Create your account</h1>
      <p className="text-sm text-slate-500">Register once for MarketLoop. You can start as a buyer or seller now and later use the same account for both roles.</p>
      {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-emerald-700">{message}</p>}
      <input className="input" name="name" placeholder="Full name" value={form.name} onChange={update} />
      <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={update} />
      <input className="input" name="phone" placeholder="Phone number (optional)" value={form.phone} onChange={update} />
      <PasswordInput name="password" value={form.password} onChange={update} />
      <select className="input" name="role" value={form.role} onChange={update}>
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
      </select>
      <button className="btn w-full" disabled={loading}>{loading ? 'Sending OTP...' : 'Register & Send OTP'}</button>
      <p className="text-sm text-slate-500">
        Already verified? <Link className="font-semibold text-brand-700" to="/login">Login here</Link>
      </p>
    </form>
  );
}
