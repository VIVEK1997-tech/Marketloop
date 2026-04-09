export default function Filters({ filters, setFilters, showKeyword = true }) {
  const update = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className={`card grid gap-3 ${showKeyword ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
      {showKeyword && (
        <input className="input md:col-span-2" name="keyword" placeholder="Search phones, bikes, furniture..." value={filters.keyword} onChange={update} />
      )}
      <input className="input" name="category" placeholder="Category" value={filters.category} onChange={update} />
      <input className="input" name="location" placeholder="Location" value={filters.location} onChange={update} />
      <input className="input" name="maxPrice" type="number" min="0" step="1" placeholder="Max price (₹)" value={filters.maxPrice} onChange={update} />
      <select className="input" name="sort" value={filters.sort} onChange={update}>
        <option value="latest">Latest</option>
        <option value="priceAsc">Price low to high</option>
        <option value="priceDesc">Price high to low</option>
        <option value="oldest">Oldest</option>
      </select>
    </section>
  );
}
