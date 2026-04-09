import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'buyer' });

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-lg space-y-4">
      <h1 className="text-3xl font-black">Create your account</h1>
      {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      <input className="input" name="name" placeholder="Full name" value={form.name} onChange={update} />
      <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={update} />
      <input className="input" name="phone" placeholder="Phone number" value={form.phone} onChange={update} />
      <input className="input" name="password" type="password" placeholder="Password" value={form.password} onChange={update} />
      <select className="input" name="role" value={form.role} onChange={update}>
        <option value="buyer">Buyer</option>
        <option value="seller">Seller</option>
      </select>
      <button className="btn w-full" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
    </form>
  );
}
