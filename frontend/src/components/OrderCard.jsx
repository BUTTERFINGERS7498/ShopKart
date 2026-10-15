import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export default function OrderCard({ order }) {
  const placedOn = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(order.createdAt));

  return (
    <article className="order-card">
      <header className="summary-row">
        <h2>Order #{order._id}</h2>
        <span>{placedOn}</span>
      </header>
      <ul className="order-lines">
        {order.items.map((item) => (
          <li key={`${order._id}-${item.product}`}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>
      <div className="summary-row">
        <span>Total: {formatPrice(order.totalAmount)}</span>
        <span>Status: {order.status}</span>
      </div>
      <Link className="button" to={`/orders/${order._id}`}>
        View Details
      </Link>
    </article>
  );
}
