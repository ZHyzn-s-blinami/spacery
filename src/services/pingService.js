import axios from 'axios';

const API_URL = 'https://prod-team-5-qnkvbg7c.final.prodcontest.ru';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Обработка всех ответов (успешных и с ошибками)
apiClient.interceptors.response.use(
  response => {
    // Проверка статус-кода для успешных ответов
    if (response.status !== 200) {
      localStorage.removeItem('userToken');
      window.location.href = '/auth';
      return Promise.reject(new Error(`Received status code ${response.status} instead of 200`));
    }
    return response;
  },
  error => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    
    // Всегда удаляем токен и делаем редирект при любой ошибке
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