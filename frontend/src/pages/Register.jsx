import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.password || !form.phone) {
      setError('All fields are required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/customers/register', form);
      navigate('/login');
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Unable to create account.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-layout">
        <form className="auth-card" onSubmit={submit} noValidate>
          <p className="eyebrow">Create account</p>
          <h1>Join ShopKart</h1>
          <label>
            Full Name
            <input name="fullName" value={form.fullName} onChange={updateField} autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} autoComplete="new-password" />
          </label>
          <label>
            Phone Number
            <input name="phone" value={form.phone} onChange={updateField} autoComplete="tel" />
          </label>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="muted">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </main>
    </>
  );
}
