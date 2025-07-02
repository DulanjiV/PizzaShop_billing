import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Items API
export const itemsAPI = {
  getAll: () => api.get('/items'),
  create: (item) => api.post('/items', item),
  update: (id, item) => api.put(`/items/${id}`, item),
  delete: (id) => api.delete(`/items/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (category) => api.post('/categories', category),
  update: (id, category) => api.put(`/categories/${id}`, category),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Invoices API
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (invoice) => api.post('/invoices', invoice),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (customer) => api.post('/customers', customer),
  update: (id, customer) => api.put(`/customers/${id}`, customer),
  delete: (id) => api.delete(`/customers/${id}`),
};

export default api;