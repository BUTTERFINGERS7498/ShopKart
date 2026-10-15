import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const { cartCount, clearCart } = useCart();

  useEffect(() => {
    let active = true;

    api
      .get('/customers/me')
      .then((response) => {
        if (active) setUser(response.data);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      setWishlistCount(0);
      return undefined;
    }

    let active = true;

    const loadCount = () => {
      api
        .get('/wishlist')
        .then((response) => {
          if (active) setWishlistCount(response.data.count);
        })
        .catch(() => {
          if (active) setWishlistCount(0);
        });
    };

    loadCount();
    window.addEventListener('wishlist-changed', loadCount);

    return () => {
      active = false;
      window.removeEventListener('wishlist-changed', loadCount);
    };
  }, [user, location.pathname]);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/customers/logout');
      clearCart();
    } finally {
      setLoggingOut(false);
      navigate('/login');
    }
  };

  return (
    <header className="navbar">
      <Link className="brand" to={user ? '/home' : '/login'}>
        ShopKart
      </Link>
      <nav aria-label="Primary">
        {user ? (
          <>
            <Link to="/home">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/wishlist">Wishlist ({wishlistCount})</Link>
            <Link to="/cart">Cart ({cartCount})</Link>
            <Link to="/orders">Orders</Link>
            <button type="button" onClick={logout} disabled={loggingOut}>
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
