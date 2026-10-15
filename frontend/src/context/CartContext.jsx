import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const CartContext = createContext(null);

const messageFrom = (error, fallback) =>
  error.response?.data?.message || fallback;

export function CartProvider({ children }) {
  const location = useLocation();
  const hasLoaded = useRef(false);
  const [cartItems, setCartItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [busyIds, setBusyIds] = useState({});

  const refreshCart = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setStatus('loading');

    try {
      const response = await api.get('/cart');
      setCartItems(response.data.cart || []);
      setStatus('ready');
      hasLoaded.current = true;
    } catch (error) {
      if (error.response?.status === 401) {
        setCartItems([]);
        setStatus('ready');
        hasLoaded.current = true;
        return;
      }

      if (!quiet) setStatus('error');
    }
  }, []);

  useEffect(() => {
    refreshCart({ quiet: hasLoaded.current });
  }, [location.pathname, refreshCart]);

  const runItemAction = useCallback(async (productId, action, request, fallback) => {
    setBusyIds((current) => ({ ...current, [productId]: action }));

    try {
      const response = await request();
      setCartItems(response.data.cart || []);
      setStatus('ready');
      hasLoaded.current = true;
    } catch (error) {
      throw new Error(messageFrom(error, fallback));
    } finally {
      setBusyIds((current) => {
        const next = { ...current };
        delete next[productId];
        return next;
      });
    }
  }, []);

  const addToCart = useCallback(
    (productId) =>
      runItemAction(
        productId,
        'add',
        () => api.post(`/cart/${productId}`),
        'Unable to add this product to your cart.'
      ),
    [runItemAction]
  );

  const updateQuantity = useCallback(
    (productId, quantity) =>
      runItemAction(
        productId,
        'update',
        () => api.patch(`/cart/${productId}`, { quantity }),
        'Unable to update quantity.'
      ),
    [runItemAction]
  );

  const removeFromCart = useCallback(
    (productId) =>
      runItemAction(
        productId,
        'remove',
        () => api.delete(`/cart/${productId}`),
        'Unable to remove this product.'
      ),
    [runItemAction]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setStatus('ready');
  }, []);

  const value = useMemo(() => {
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity,
      0
    );

    return {
      cartItems,
      status,
      busyIds,
      cartCount,
      subtotal,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    };
  }, [
    cartItems,
    status,
    busyIds,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
