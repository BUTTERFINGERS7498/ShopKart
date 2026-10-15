export default function SearchBar({
  search,
  category,
  sort,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}) {
  return (
    <form className="search-bar" role="search" onSubmit={(event) => event.preventDefault()}>
      <label>
        Search products
        <input
          type="search"
          value={search}
          placeholder="Search products..."
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      <label>
        Category
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>
      </label>
      <label>
        Sort
        <select value={sort} onChange={(event) => onSortChange(event.target.value)}>
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </label>
    </form>
  );
}
