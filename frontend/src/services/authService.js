import axios from 'axios';

const API_URL = 'localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
)

export const authService = {
  register: async (userData) => {
    try {
      const response = await apiClient.post('/user/sign-up', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post('/user/sign-in', credentials);
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      }
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    localStorage.removeItem('userToken');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  getUser: async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await apiClient.get('/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      return response.data;
    }
    catch (error) {
      throw error;
    }
  },
}