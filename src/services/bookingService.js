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

export const bookingService = {
  getBooks: async (name) => {
    try {
      const token = localStorage.getItem('userToken');
    
      const response = await apiClient.get(`/api/booking/${name}/place`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getPlace: async (name) => {
    const token = localStorage.getItem('userToken');

    const response = await apiClient.get(`/api/place/${name}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

    console.log(response.data);
    return response.data;
  },
  cancelBooking: async (uuid) => {
    try {
      const token = localStorage.getItem('userToken');

      const response = await apiClient.post(`/api/booking/${uuid}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      },
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}