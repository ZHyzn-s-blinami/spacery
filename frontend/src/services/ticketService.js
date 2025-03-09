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

export const ticketService = {
  getByPlace: async (name) => {
    try {
      const token = localStorage.getItem('userToken');

      const response = await apiClient.get(`/api/tickets/getByPlace/${name}`, {
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
  updateTicketStatus: async(ticketId, status) => {
    const token = localStorage.getItem('userToken');

    const response = await apiClient.post(`/api/tickets/setStatus/${ticketId}/${status}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

    return response.data;
  },
  getAll: async () => {
    const token = localStorage.getItem('userToken');

    const response = await apiClient.get('/api/tickets/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

    return response.data;
  }
}