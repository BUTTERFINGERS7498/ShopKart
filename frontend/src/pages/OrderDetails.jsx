import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { formatPrice } from '../utils/format';

export default function OrderDetails({ confirmed = false }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setStatus('loading');
    api
      .get(`/orders/${id}`)
      .then((response) => {
        setOrder(response.data.order);
        setStatus('ready');
      })
      .catch((error) => {
        setMessage(error.response?.data?.message || 'Unable to load this order.');
        setStatus('error');
      });
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="page">
        {status === 'loading' ? <p aria-busy="true">Loading your order...</p> : null}
        {status === 'error' ? (
          <section className="state-panel" role="alert">
            <h2>{message}</h2>
            <Link className="button" to="/orders">
              View My Orders
            </Link>
          </section>
        ) : null}
        {status === 'ready' && order ? (
          <section className="success-panel">
            {confirmed ? (
              <>
                <p className="heart" aria-hidden="true">
                  ✓
                </p>
                <h1>Order Placed Successfully</h1>
                <p>Your order has been saved successfully.</p>
              </>
            ) : (
              <h1>Order Details</h1>
            )}
            <dl>
              <div>
                <dt>Order ID</dt>
                <dd>{order._id}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatPrice(order.totalAmount)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{order.status}</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>{order.paymentStatus}</dd>
              </div>
            </dl>
            <ul className="order-lines">
              {order.items.map((item) => (
                <li className="summary-row" key={`${item.product}-${item.name}`}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p>
              {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},{' '}
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.pincode}
            </p>
            <div className="card-actions">
              <Link className="button" to="/orders">
                View My Orders
              </Link>
              <Link className="button primary" to="/products">
                Continue Shopping
              </Link>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
