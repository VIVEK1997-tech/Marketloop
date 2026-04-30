import { groceryCategoryMap } from '../../utils/groceryData.js';

const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';

export default function ProductImageGallery({ title, category, images, activeImage, onSelectImage }) {
  const safeImages = images?.length ? images : [groceryCategoryMap[category]?.image || fallbackImage];
  const selectedImage = activeImage || safeImages[0];
  const fallback = groceryCategoryMap[category]?.image || fallbackImage;

  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="rounded-[1.5rem] bg-[#f6f7f9] p-3">
          <img
            src={selectedImage}
            alt={title}
            className="h-[18rem] w-full rounded-[1.25rem] object-cover md:h-[24rem]"
            onError={(event) => {
              event.currentTarget.src = fallback;
            }}
          />
        </div>
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {safeImages.map((image) => (
            <button
              key={image}
              type="button"
              onClick={() => onSelectImage(image)}
              className={`overflow-hidden rounded-[1.1rem] border bg-white p-1 shadow-sm ${
                selectedImage === image ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              <img src={image} alt={title} className="h-16 w-16 rounded-xl object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
