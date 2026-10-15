import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OrderCard from '../components/OrderCard';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');

  const loadOrders = () => {
    setStatus('loading');
    api
      .get('/orders')
      .then((response) => {
        setOrders(response.data.orders);
        setStatus(response.data.orders.length ? 'ready' : 'empty');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <>
      <Navbar />
      <main className="page">
        <header className="page-header">
          <h1>My Orders</h1>
        </header>
        {status === 'loading' ? <p aria-busy="true">Loading your orders...</p> : null}
        {status === 'error' ? (
          <section className="state-panel" role="alert">
            <h2>Unable to load your orders.</h2>
            <button className="button" type="button" onClick={loadOrders}>
              Try Again
            </button>
          </section>
        ) : null}
        {status === 'empty' ? (
          <section className="state-panel">
            <h2>You have not placed any orders yet.</h2>
            <Link className="button primary" to="/products">
              Start Shopping
            </Link>
          </section>
        ) : null}
        {status === 'ready' ? (
          <section className="stack" aria-label="Your orders">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
