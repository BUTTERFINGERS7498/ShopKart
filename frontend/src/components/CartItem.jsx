import { formatPrice } from '../utils/format';

export default function CartItem({ item, busy, onIncrease, onDecrease, onRemove }) {
  const product = item.product;
  const lineTotal = (product.price || 0) * item.quantity;
  const atStockLimit = !product.unavailable && item.quantity >= product.stock;

  return (
    <article className="cart-item">
      {product.image ? <img src={product.image} alt="" /> : <div className="cart-image-fallback" />}
      <div>
        <h2>{product.name}</h2>
        {product.category ? <p className="muted">{product.category}</p> : null}
        <p className="price">{product.unavailable ? 'Unavailable' : formatPrice(product.price)}</p>
        <div className="quantity-control">
          <button
            type="button"
            onClick={onDecrease}
            disabled={Boolean(busy) || item.quantity <= 1}
            aria-label={`Decrease quantity of ${product.name}`}
          >
            −
          </button>
          <span aria-live="polite">{item.quantity}</span>
          <button
            type="button"
            onClick={onIncrease}
            disabled={Boolean(busy) || atStockLimit || product.unavailable}
            aria-label={`Increase quantity of ${product.name}`}
          >
            +
          </button>
        </div>
        {atStockLimit ? <p className="muted">Only {product.stock} available</p> : null}
      </div>
      <div className="cart-item-side">
        <strong>{formatPrice(lineTotal)}</strong>
        <button type="button" onClick={onRemove} disabled={Boolean(busy)}>
          {busy === 'remove' ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </article>
  );
}
