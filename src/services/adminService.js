import axios from 'axios';

const API_URL = 'https://prod-team-5-qnkvbg7c.final.prodcontest.ru';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

export const adminService = {
  admin_only: async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await apiClient.post('/api/admin-only', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};