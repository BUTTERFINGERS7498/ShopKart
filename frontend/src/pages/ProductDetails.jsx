import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice, stockLabel } from '../utils/format';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState('loading');
  const [wishlistStatus, setWishlistStatus] = useState('idle');
  const [wishlistError, setWishlistError] = useState('');
  const [cartError, setCartError] = useState('');
  const { cartItems, busyIds, addToCart } = useCart();
  const inCart = cartItems.some((item) => item.product?._id === id);
  const adding = busyIds[id] === 'add';

  useEffect(() => {
    setStatus('loading');
    api
      .get(`/products/${id}`)
      .then((response) => {
        setProduct(response.data);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          setStatus('missing');
          return;
        }
        setStatus('error');
      });

    api
      .get('/wishlist')
      .then((response) => {
        setSaved(response.data.wishlist.some((item) => item._id === id));
      })
      .catch(() => setSaved(false));
  }, [id]);

  const toggleWishlist = async () => {
    if (wishlistStatus === 'saving') return;
    setWishlistStatus('saving');
    setWishlistError('');
    try {
      const response = await api.patch(`/wishlist/${id}/toggle`);
      setSaved(response.data.saved);
      window.dispatchEvent(new Event('wishlist-changed'));
    } catch {
      setWishlistError('Unable to save product. Please try again.');
    } finally {
      setWishlistStatus('idle');
    }
  };

  const addProduct = async () => {
    setCartError('');
    try {
      await addToCart(id);
    } catch (requestError) {
      setCartError(requestError.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <Link to="/products">Back to products</Link>
        {status === 'loading' ? <p aria-busy="true">Loading products...</p> : null}
        {status === 'error' ? (
          <p className="form-error" role="alert">
            Something went wrong while loading products.
          </p>
        ) : null}
        {status === 'missing' ? <p>No products found.</p> : null}
        {status === 'ready' && product ? (
          <article className="details">
            <img src={product.image} alt="" />
            <div>
              <p className="eyebrow">{product.category}</p>
              <h1>{product.name}</h1>
              <p className="price">{formatPrice(product.price)}</p>
              <p>{product.description}</p>
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
                <button type="button" onClick={toggleWishlist} disabled={wishlistStatus === 'saving'}>
                  {wishlistStatus === 'saving'
                    ? 'Saving...'
                    : saved
                      ? '♥ Remove from Wishlist'
                      : '♡ Add to Wishlist'}
                </button>
              </div>
              {cartError || wishlistError ? (
                <p className="form-error" role="alert">
                  {cartError || wishlistError}
                </p>
              ) : null}
            </div>
          </article>
        ) : null}
      </main>
    </>
  );
}
