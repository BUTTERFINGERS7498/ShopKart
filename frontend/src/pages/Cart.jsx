import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function Cart() {
  const { cartItems, status, busyIds, subtotal, refreshCart, updateQuantity, removeFromCart } =
    useCart();
  const [actionError, setActionError] = useState('');

  const changeQuantity = async (item, nextQuantity) => {
    setActionError('');
    try {
      await updateQuantity(item.product._id, nextQuantity);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const removeItem = async (item) => {
    setActionError('');
    try {
      await removeFromCart(item.product._id);
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <header className="page-header">
          <h1>My Cart</h1>
        </header>
        {status === 'loading' ? <p aria-busy="true">Loading your cart...</p> : null}
        {status === 'error' ? (
          <section className="state-panel" role="alert">
            <h2>Unable to load your cart.</h2>
            <button className="button" type="button" onClick={() => refreshCart()}>
              Try Again
            </button>
          </section>
        ) : null}
        {status === 'ready' && cartItems.length === 0 ? (
          <section className="state-panel">
            <p className="heart" aria-hidden="true">
              🛒
            </p>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven&apos;t added anything yet.</p>
            <Link className="button primary" to="/products">
              Browse Products
            </Link>
          </section>
        ) : null}
        {status === 'ready' && cartItems.length > 0 ? (
          <div className="cart-layout">
            <section className="stack" aria-label="Cart items">
              {actionError ? (
                <p className="form-error" role="alert">
                  {actionError}
                </p>
              ) : null}
              {cartItems.map((item) => (
                <CartItem
                  key={item.product._id}
                  item={item}
                  busy={Boolean(busyIds[item.product._id])}
                  onDecrease={() => changeQuantity(item, item.quantity - 1)}
                  onIncrease={() => changeQuantity(item, item.quantity + 1)}
                  onRemove={() => removeItem(item)}
                />
              ))}
            </section>
            <aside className="summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Items</span>
                <span>{cartItems.reduce((total, item) => total + item.quantity, 0)}</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Link className="button primary" to="/checkout">
                Proceed to Checkout
              </Link>
            </aside>
          </div>
        ) : null}
      </main>
    </>
  );
}
