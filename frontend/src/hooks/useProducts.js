import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../services/api.js';

export const useProducts = (filters) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined && value !== null)
        );
        const maxPrice = params.maxPrice === undefined ? undefined : Number(params.maxPrice);
        const minPrice = params.minPrice === undefined ? undefined : Number(params.minPrice);
        const { data } = await api.get('/products', { params });

        const filteredProducts = data.products.filter((product) => {
          const price = Number(product.price);
          if (Number.isFinite(minPrice) && price < minPrice) return false;
          if (Number.isFinite(maxPrice) && price > maxPrice) return false;
          return true;
        });

        setProducts(filteredProducts);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [JSON.stringify(filters)]);

  return { products, loading, error };
};
