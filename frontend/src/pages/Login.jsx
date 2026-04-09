import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNeedsVerification(false);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      setNeedsVerification(message === 'Please verify your email first');
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-black">Welcome back</h1>
      {location.state?.verified && <p className="rounded-xl bg-emerald-50 p-3 text-emerald-700">Email verified successfully. You can login now.</p>}
      {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="btn w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      {needsVerification && (
        <Link
          className="btn-secondary w-full"
          to="/verify-otp"
          state={{ email: form.email }}
        >
          Verify email now
        </Link>
      )}
      <p className="text-sm text-slate-500">New here? <Link className="font-semibold text-brand-700" to="/register">Create an account</Link></p>
    </form>
  );
}
