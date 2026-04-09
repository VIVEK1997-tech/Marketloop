import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    verifyOtp,
    resendOtp
  } = useAuth();

  const initialEmail = useMemo(
    () => location.state?.email || pendingVerificationEmail || '',
    [location.state?.email, pendingVerificationEmail]
  );

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await verifyOtp({ email, otp });
      setMessage(response.message || 'Email verified successfully');
      navigate('/login', { replace: true, state: { email, verified: true } });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setResendLoading(true);
    try {
      const response = await resendOtp(email);
      setPendingVerificationEmail(email);
      setMessage(response.message || 'OTP sent to email');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4">
      <h1 className="text-3xl font-black">Verify your email</h1>
      <p className="text-sm text-slate-500">
        Enter the 6-digit OTP sent to your email. The code expires in 10 minutes.
      </p>
      {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p className="rounded-xl bg-emerald-50 p-3 text-emerald-700">{message}</p>}
      <input
        className="input"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setPendingVerificationEmail(event.target.value);
        }}
      />
      <input
        className="input tracking-[0.35em]"
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="Enter OTP"
        value={otp}
        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      <button className="btn w-full" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
      <button
        className="btn-secondary w-full"
        type="button"
        onClick={handleResendOtp}
        disabled={resendLoading || !email}
      >
        {resendLoading ? 'Sending OTP...' : 'Resend OTP'}
      </button>
      <p className="text-sm text-slate-500">
        Already verified? <Link className="font-semibold text-brand-700" to="/login">Go to login</Link>
      </p>
    </form>
  );
}
