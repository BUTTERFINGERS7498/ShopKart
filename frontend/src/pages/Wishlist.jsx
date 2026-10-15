import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import api from '../services/api';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  const loadWishlist = () => {
    setStatus('loading');
    api
      .get('/wishlist')
      .then((response) => {
        setItems(response.data.wishlist);
        setStatus(response.data.wishlist.length ? 'ready' : 'empty');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const onRemoved = (productId) => {
    setItems((current) => {
      const next = current.filter((item) => item._id !== productId);
      setStatus(next.length ? 'ready' : 'empty');
      return next;
    });
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <header className="page-header">
          <h1>My Wishlist</h1>
          {status === 'ready' ? (
            <p>
              {items.length} product{items.length === 1 ? '' : 's'} saved
            </p>
          ) : null}
        </header>
        {status === 'loading' ? <p aria-busy="true">Loading your wishlist...</p> : null}
        {status === 'error' ? (
          <section className="state-panel" role="alert">
            <h2>Something went wrong.</h2>
            <p>We couldn&apos;t load your wishlist.</p>
            <button className="button" type="button" onClick={loadWishlist}>
              Try Again
            </button>
          </section>
        ) : null}
        {status === 'empty' ? (
          <section className="state-panel">
            <p className="heart" aria-hidden="true">
              ♥
            </p>
            <h2>Your wishlist is empty</h2>
            <p>Save products you love and find them here later.</p>
            <Link className="button primary" to="/products">
              Browse Products
            </Link>
          </section>
        ) : null}
        {status === 'ready' ? (
          <section className="product-grid" aria-label="Saved products">
            {items.map((product) => (
              <WishlistCard key={product._id} product={product} onRemoved={onRemoved} />
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
