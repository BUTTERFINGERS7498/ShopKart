import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Invalid Credentials');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/customers/login', { email, password });
      navigate('/home');
    } catch {
      setError('Invalid Credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-layout">
        <form className="auth-card" onSubmit={submit} noValidate>
          <p className="eyebrow">Welcome back</p>
          <h1>Log in to ShopKart</h1>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
          <p className="muted">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </main>
    </>
  );
}
