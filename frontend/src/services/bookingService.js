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

        return response.data;
    },

    getMeetings: async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await apiClient.get(`/api/booking/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
            localStorage.setItem('userMeetings', JSON.stringify(response.data))
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    cancelUserMeeting: async (uuid) => {
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
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    updateMeeting: async ({ uuid, startAt, endAt }) => {
        try {
            const token = localStorage.getItem('userToken');

            const payload = {
                startAt,
                endAt,
            };

            const response = await apiClient.post(
                `/api/booking/${uuid}/update`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    params: {
                        startAt,
                        endAt,
                    },
                }
            );

            return response.data;

        } catch (error) {
            console.error("Ошибка при обновлении встречи:", error);
            throw error;
        }
    },
    getQrCode: async (uuid) => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await apiClient.get(`/api/booking/${uuid}/qr`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

}