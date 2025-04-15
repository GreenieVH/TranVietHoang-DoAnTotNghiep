import { useState, useEffect } from 'react';
import { getProducts } from '../api/product';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
  });

  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      const { page, limit, ...filters } = params;
      const data = await getProducts({
        page: page || pagination.page,
        limit: limit || pagination.limit,
        ...filters,
      });
      
      setProducts(data.products);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(initialParams);
  }, []);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
  };
};