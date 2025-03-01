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
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
)

export const placeService = {
  get: async (type, capacity, start, end) => {
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
