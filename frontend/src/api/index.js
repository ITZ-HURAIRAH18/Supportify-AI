import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const getConversations = async (skip = 0, limit = 100) => {
  const response = await api.get('/conversations', { params: { skip, limit } });
  return response.data;
};

export const getUsers = async (skip = 0, limit = 100) => {
  const response = await api.get('/users', { params: { skip, limit } });
  return response.data;
};

export const getProducts = async (skip = 0, limit = 100) => {
  const response = await api.get('/products', { params: { skip, limit } });
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const getOrders = async (skip = 0, limit = 100) => {
  const response = await api.get('/orders', { params: { skip, limit } });
  return response.data;
};

export const getDashboardStats = async () => {
  // In a real app, this would be a single optimized endpoint.
  // We'll aggregate from existing endpoints for now.
  const [conversations, users, products, orders] = await Promise.all([
    getConversations(0, 1000),
    getUsers(0, 1000),
    getProducts(0, 1000),
    getOrders(0, 1000)
  ]);
  
  return {
    conversations: conversations.length,
    users: users.length,
    products: products.length,
    pendingOrders: orders.filter(o => o.status.toLowerCase() === 'pending').length,
    conversationsList: conversations.slice(0, 5),
    conversationsData: conversations
  };
};
