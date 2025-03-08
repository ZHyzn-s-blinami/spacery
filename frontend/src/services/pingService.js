import axios from 'axios';

const API_URL = 'localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  response => {
    if (response.status !== 200) {
      localStorage.removeItem('userToken');
      window.location.href = '/auth';
      return Promise.reject(new Error(`Received status code ${response.status} instead of 200`));
    }
    return response;
  },
  error => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    
    localStorage.removeItem('userToken');
    window.location.href = '/auth';
    
    return Promise.reject(error);
  }
);

export const pingService = {
  pong: async () => {
    const token = localStorage.getItem('userToken');

    const response = await apiClient.get(`/api/pong`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

    return response.data;
  }
}