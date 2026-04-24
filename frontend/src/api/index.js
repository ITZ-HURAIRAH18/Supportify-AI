import axios from 'axios';

const DEFAULT_API_BASE_URL = 'https://supportify-ai-gules.vercel.app';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
});

export const getConversations = async (skip = 0, limit = 100, userId = null) => {
  const params = { skip, limit };
  if (userId !== null && userId !== undefined) {
    params.user_id = userId;
  }

  const response = await api.get('/conversations', { params });
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
    confirmedOrders: orders.filter(o => (o.status || '').toLowerCase() === 'confirmed').length,
    conversationsList: conversations.slice(0, 5),
    conversationsData: conversations,
    ordersData: orders,
  };
};
