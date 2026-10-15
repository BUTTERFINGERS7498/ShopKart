import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice, stockLabel } from '../utils/format';

export default function WishlistCard({ product, onRemoved }) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setRemoving(true);
    setError('');
    try {
      await api.delete(`/wishlist/${product._id}`);
      window.dispatchEvent(new Event('wishlist-changed'));
      onRemoved(product._id);
    } catch {
      setError('Unable to remove this product. Please try again.');
      setRemoving(false);
    }
  };

  return (
    <article className="product-card">
      <img src={product.image} alt="" />
      <div className="product-card-body">
        <h2>{product.name}</h2>
        <p className="muted">{product.category}</p>
        <p className="price">{formatPrice(product.price)}</p>
        <p>{stockLabel(product.stock)}</p>
        <div className="card-actions">
          <Link className="button" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button type="button" onClick={remove} disabled={removing}>
            {removing ? 'Removing...' : 'Remove ♥'}
          </button>
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
