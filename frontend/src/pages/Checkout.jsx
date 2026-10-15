import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { formatPrice } from '../utils/format';
import { loadRazorpayScript } from '../utils/razorpay';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
};

const validateAddress = (address) => {
  const errors = {};
  if (!address.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!address.phone.trim()) errors.phone = 'Phone number is required.';
  else if (!/^\d{10}$/.test(address.phone.trim())) errors.phone = 'Phone must be a 10-digit number.';
  if (!address.addressLine1.trim()) errors.addressLine1 = 'Address is required.';
  if (!address.city.trim()) errors.city = 'City is required.';
  if (!address.state.trim()) errors.state = 'State is required.';
  if (!address.pincode.trim()) errors.pincode = 'Pincode is required.';
  else if (!/^\d{6}$/.test(address.pincode.trim())) errors.pincode = 'Pincode must contain 6 digits.';
  return errors;
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, status, subtotal, clearCart } = useCart();
  const [address, setAddress] = useState(emptyAddress);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [placing, setPlacing] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setFormError('');

    const errors = validateAddress(address);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPlacing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setFormError('Unable to load Razorpay Checkout. Please try again.');
        setPlacing(false);
        return;
      }

      const response = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          addressLine1: address.addressLine1.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim(),
        },
      });

      const checkout = response.data;
      const payment = new window.Razorpay({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: checkout.razorpayOrderId,
        prefill: {
          name: address.fullName.trim(),
          contact: address.phone.trim(),
        },
        handler: async (paymentResponse) => {
          try {
            const verified = await api.post('/orders/verify-payment', {
              shopKartOrderId: checkout.shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            clearCart();
            navigate(`/order-success/${verified.data.order._id}`);
          } catch (error) {
            setFormError(
              error.response?.data?.message ||
                'Payment verification failed. Your cart has not been cleared.'
            );
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
        theme: { color: '#9a3412' },
      });

      payment.on('payment.failed', () => {
        setFormError('Payment failed. Your cart has not been cleared. Please try again.');
        setPlacing(false);
      });
      payment.open();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to place your order.');
      setPlacing(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <header className="page-header">
          <h1>Checkout</h1>
        </header>
        {status === 'loading' ? <p aria-busy="true">Loading your cart...</p> : null}
        {status === 'error' ? (
          <section className="state-panel" role="alert">
            <h2>Unable to load your cart.</h2>
          </section>
        ) : null}
        {status === 'ready' && cartItems.length === 0 ? (
          <section className="state-panel">
            <h2>Your cart is empty</h2>
            <p>Add a product before checking out.</p>
            <Link className="button primary" to="/products">
              Browse Products
            </Link>
          </section>
        ) : null}
        {status === 'ready' && cartItems.length > 0 ? (
          <form className="checkout-layout" onSubmit={placeOrder} noValidate>
            <section className="checkout-form">
              <h2>Shipping Details</h2>
              {[
                ['fullName', 'Full Name', 'name'],
                ['phone', 'Phone', 'tel'],
                ['addressLine1', 'Address', 'street-address'],
                ['city', 'City', 'address-level2'],
                ['state', 'State', 'address-level1'],
                ['pincode', 'Pincode', 'postal-code'],
              ].map(([name, label, autoComplete]) => (
                <label key={name}>
                  {label}
                  <input
                    name={name}
                    value={address[name]}
                    onChange={updateField}
                    autoComplete={autoComplete}
                    aria-invalid={Boolean(fieldErrors[name])}
                    aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
                  />
                  {fieldErrors[name] ? (
                    <span className="form-error" id={`${name}-error`}>
                      {fieldErrors[name]}
                    </span>
                  ) : null}
                </label>
              ))}
            </section>
            <aside className="summary">
              <h2>Order Summary</h2>
              <ul className="order-lines">
                {cartItems.map((item) => (
                  <li className="summary-row" key={item.product._id}>
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>{formatPrice((item.product.price || 0) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-row">
                <span>Total</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              {formError ? (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              ) : null}
              <button className="button primary" type="submit" disabled={placing}>
                {placing ? 'Placing order...' : 'Place Order'}
              </button>
            </aside>
          </form>
        ) : null}
      </main>
    </>
  );
}
