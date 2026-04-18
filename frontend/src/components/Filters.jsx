import { groceryBudgetOptions, groceryCategories } from '../utils/groceryData.js';

export default function Filters({ filters, setFilters, showKeyword = true }) {
  const update = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <section className={`grid gap-3 ${showKeyword ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
      {showKeyword && (
        <input
          className="input md:col-span-2"
          name="keyword"
          placeholder="Search mangoes, tomatoes, spinach..."
          value={filters.keyword}
          onChange={update}
        />
      )}

      <select className="input" name="category" value={filters.category} onChange={update}>
          <option value="">All categories</option>
        {groceryCategories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>

      <input
        className="input"
        name="location"
        placeholder="Delivery area or city"
        value={filters.location}
        onChange={update}
      />

      <select className="input" name="maxPrice" value={filters.maxPrice} onChange={update}>
          <option value="">Budget</option>
        {groceryBudgetOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select className="input" name="sort" value={filters.sort} onChange={update}>
        <option value="latest">Fresh arrivals</option>
        <option value="priceAsc">Price low to high</option>
        <option value="priceDesc">Price high to low</option>
        <option value="oldest">Oldest</option>
      </select>
    </section>
  );
}
