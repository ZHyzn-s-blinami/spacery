import axios from 'axios';

const API_URL = 'http://127.0.0.1:8080';

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

export const placeService = {
  get: async (start, end) => {
    try {
      const token = localStorage.getItem('userToken');
    
      const response = await apiClient.get(`/api/place/free`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',

        },
        params: {
          start,
          end
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getByName: async (name) => {
    try {
      const token = localStorage.getItem('userToken');

      const response = await apiClient.get(`/api/place/${name}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
      return response.data;
    } catch (error) {
    }
  },
  post: async (placeData) => {
    try {
      const token = localStorage.getItem('userToken');
      
      const response = await apiClient.post(
        '/api/booking/create', 
        placeData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
