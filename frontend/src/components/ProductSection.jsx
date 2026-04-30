import ProductCard from './ProductCard.jsx';

export default function ProductSection({
  title,
  subtitle,
  products,
  onWishlist,
  isWishlisted,
  onAddToCart,
  emptyMessage
}) {
  if (!products?.length) {
    return (
      <section className="space-y-2">
        <div>
          <p className="text-sm font-semibold text-emerald-700">{subtitle}</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">{title}</h2>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
          {emptyMessage}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-emerald-700">{subtitle}</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">{title}</h2>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4 pr-2">
          {products.map((product) => (
            <div key={product._id || product.id} className="w-[220px] shrink-0">
              <ProductCard
                product={product}
                onWishlist={onWishlist}
                isWishlisted={isWishlisted(product)}
                onAddToCart={onAddToCart}
                compact
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
