import axios from "axios";

const API_URL = 'https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api';

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
    cancelBooking: async (id) => {
        const token = localStorage.getItem('userToken')
        try {
            const response = await axios.post(`/booking/${id}/cancel`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
            console.log(response.data)
            return response.data
        } catch (error) {
            throw error;
        }
    }
}
