import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function Home() {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/customers/me')
      .then((response) => setCustomer(response.data))
      .catch(() => setError('Unable to load your profile.'));
  }, []);

  return (
    <>
      <Navbar />
      <main className="page">
        <section className="hero">
          <p className="eyebrow">ShopKart</p>
          <h1>{customer ? `Welcome, ${customer.fullName}` : 'Welcome'}</h1>
          <p>Browse the catalog, save what you love, and come back when you are ready.</p>
          <Link className="button primary" to="/products">
            Browse Products
          </Link>
        </section>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        {customer ? (
          <section className="profile-card" aria-label="Your account">
            <h2>Your account</h2>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{customer.fullName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{customer.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{customer.phone}</dd>
              </div>
            </dl>
          </section>
        ) : null}
      </main>
    </>
  );
}
