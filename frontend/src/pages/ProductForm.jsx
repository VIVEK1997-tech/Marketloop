import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getErrorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { groceryCategories } from '../utils/groceryData.js';

const initialState = { title: '', description: '', price: '', category: '', location: '', images: '' };

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const product = data.product;
      setForm({
        title: product.title,
        description: product.description,
        price: product.price,
        category: product.category,
        location: product.location,
        images: product.images?.join(', ') || ''
      });
    });
  }, [id]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const previews = useMemo(() => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => {
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [previews]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('description', form.description);
      payload.append('price', form.price);
      payload.append('category', form.category);
      payload.append('location', form.location);
      form.images
        .split(',')
        .map((image) => image.trim())
        .filter(Boolean)
        .forEach((image) => payload.append('imageUrls', image));
      files.forEach((file) => payload.append('images', file));

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = id ? await api.put(`/products/${id}`, payload, config) : await api.post('/products', payload, config);
      navigate(`/products/${data.product._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  if (!userRoles.includes('seller') && !userRoles.includes('admin')) {
    return (
      <div className="card mx-auto max-w-2xl space-y-4">
        <h1 className="text-3xl font-black">Seller access required</h1>
        <p className="text-slate-600">Only sellers can create or manage listings. Enable seller access from your dashboard to start posting products.</p>
        <Link className="btn w-fit" to="/dashboard">Go to dashboard</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-black">{id ? 'Edit listing' : 'Create listing'}</h1>
      <p className="text-sm text-slate-500">Create grocery-style listings for fruits, vegetables, herbs, and fresh produce buyers can discover quickly.</p>
      {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      <input className="input" name="title" placeholder="Example: Premium Alphonso Mango Box" value={form.title} onChange={update} />
      <textarea className="input min-h-40" name="description" placeholder="Describe freshness, quantity, sourcing, and delivery details" value={form.description} onChange={update} />
      <div className="grid gap-4 md:grid-cols-3">
        <input className="input" name="price" type="number" placeholder="Price in Rs." value={form.price} onChange={update} />
        <select className="input" name="category" value={form.category} onChange={update}>
          <option value="">Select category</option>
          {form.category && !groceryCategories.some((category) => category.value === form.category) && (
            <option value={form.category}>{form.category}</option>
          )}
          {groceryCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <input className="input" name="location" placeholder="Delivery city or locality" value={form.location} onChange={update} />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700" htmlFor="product-images">Upload product images</label>
        <input
          id="product-images"
          className="input"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files).slice(0, 6))}
        />
        <p className="text-sm text-slate-500">You can upload up to 6 images. JPG, PNG, and WebP files work best.</p>
      </div>
      {!!previews.length && (
        <div className="grid gap-3 sm:grid-cols-3">
          {previews.map((preview) => (
            <img key={preview.url} src={preview.url} alt={preview.name} className="h-32 rounded-2xl object-cover" />
          ))}
        </div>
      )}
      <input className="input" name="images" placeholder="Optional image URLs separated by commas" value={form.images} onChange={update} />
      <button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save listing'}</button>
    </form>
  );
}
