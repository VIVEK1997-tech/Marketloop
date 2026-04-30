export default function BuyingActions({ onAddToCart, onBuyNow }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <button type="button" className="btn-secondary w-full justify-center" onClick={onAddToCart}>
        Add to cart
      </button>
      <button type="button" className="btn w-full justify-center bg-emerald-600 hover:bg-emerald-700" onClick={onBuyNow}>
        Buy now
      </button>
    </div>
  );
}
