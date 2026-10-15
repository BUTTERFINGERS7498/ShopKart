import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setStatus('loading');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (sort) params.sort = sort;

      api
        .get('/products', { params, signal: controller.signal })
        .then((response) => {
          setProducts(response.data.products);
          setStatus(response.data.products.length ? 'ready' : 'empty');
        })
        .catch((error) => {
          if (error.code === 'ERR_CANCELED') return;
          setStatus('error');
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, sort]);

  useEffect(() => {
    api
      .get('/wishlist')
      .then((response) => setSavedIds(response.data.wishlist.map((item) => item._id)))
      .catch(() => setSavedIds([]));
  }, []);

  const onWishlistChange = (productId, saved) => {
    setSavedIds((current) =>
      saved ? [...current, productId] : current.filter((id) => id !== productId)
    );
  };

  return (
    <>
      <Navbar />
      <main className="page">
        <header className="page-header">
          <h1>Products</h1>
          <p>Find something worth saving.</p>
        </header>
        <SearchBar
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />
        {status === 'loading' ? <p aria-busy="true">Loading products...</p> : null}
        {status === 'error' ? (
          <p className="form-error" role="alert">
            Something went wrong while loading products.
          </p>
        ) : null}
        {status === 'empty' ? <p>No products found.</p> : null}
        {status === 'ready' ? (
          <section className="product-grid" aria-label="Product list">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                saved={savedIds.includes(product._id)}
                onWishlistChange={onWishlistChange}
              />
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}
