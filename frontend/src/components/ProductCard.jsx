import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice, stockLabel } from '../utils/format';

export default function ProductCard({ product, saved, onWishlistChange }) {
  const { cartItems, busyIds, addToCart } = useCart();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [cartError, setCartError] = useState('');
  const inCart = cartItems.some((item) => item.product?._id === product._id);
  const adding = busyIds[product._id] === 'add';

  const toggleWishlist = async () => {
    if (status === 'saving') return;
    setStatus('saving');
    setError('');

    try {
      const response = await api.patch(`/wishlist/${product._id}/toggle`);
      setStatus('idle');
      onWishlistChange(product._id, response.data.saved);
      window.dispatchEvent(new Event('wishlist-changed'));
    } catch {
      setStatus('idle');
      setError('Unable to save product. Please try again.');
    }
  };

  const addProduct = async () => {
    setCartError('');
    try {
      await addToCart(product._id);
    } catch (requestError) {
      setCartError(requestError.message);
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
          <button
            className="button primary"
            type="button"
            onClick={addProduct}
            disabled={adding || product.stock < 1}
          >
            {adding ? 'Adding...' : inCart ? 'Add Another' : 'Add to Cart'}
          </button>
          <Link className="button" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button type="button" onClick={toggleWishlist} disabled={status === 'saving'}>
            {status === 'saving'
              ? 'Saving...'
              : saved
                ? '♥ Remove from Wishlist'
                : '♡ Add to Wishlist'}
          </button>
        </div>
        {cartError || error ? (
          <p className="form-error" role="alert">
            {cartError || error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
