export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

export const stockLabel = (stock) =>
  stock > 0 ? `${stock} units left` : 'Out of stock';
