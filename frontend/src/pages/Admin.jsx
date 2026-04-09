import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    api.get('/admin/stats').then(({ data }) => setStats(data.stats));
    api.get('/admin/users').then(({ data }) => setUsers(data.users));
    api.get('/products', { params: { status: 'available' } }).then(({ data }) => setProducts(data.products));
  }, [user?.role]);

  const toggleBan = async (target) => {
    const { data } = await api.patch(`/admin/users/${target._id}/ban`, { isBanned: !target.isBanned });
    setUsers((current) => current.map((item) => (item._id === target._id ? data.user : item)));
  };

  const removeListing = async (productId) => {
    await api.delete(`/admin/products/${productId}`);
    setProducts((current) => current.filter((product) => product._id !== productId));
  };

  if (user?.role !== 'admin') {
    return <p className="card">Only admins can access this page.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Admin panel</h1>
      {stats && (
        <section className="grid gap-4 md:grid-cols-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="card">
              <p className="text-sm uppercase tracking-wider text-slate-500">{key}</p>
              <p className="text-3xl font-black">{value}</p>
            </div>
          ))}
        </section>
      )}
      <section className="card overflow-x-auto">
        <h2 className="mb-4 text-2xl font-black">Users</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item._id} className="border-b last:border-0">
                <td className="py-3 font-semibold">{item.name}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>{item.isBanned ? 'Banned' : 'Active'}</td>
                <td><button className="btn-secondary py-2" onClick={() => toggleBan(item)}>{item.isBanned ? 'Unban' : 'Ban'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card overflow-x-auto">
        <h2 className="mb-4 text-2xl font-black">Listing moderation</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-3">Title</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Location</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b last:border-0">
                <td className="py-3 font-semibold">{product.title}</td>
                <td>{product.seller?.name}</td>
                <td>₹{Number(product.price).toLocaleString('en-IN')}</td>
                <td>{product.location}</td>
                <td><button className="btn-secondary py-2 text-red-600" onClick={() => removeListing(product._id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
