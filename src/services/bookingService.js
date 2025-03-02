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
            console.log(response.data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // updateMeeting: async ({uuid, startAt, endAt}) => {
    //     if (!uuid) {
    //         console.error("Ошибка: ID встречи отсутствует!");
    //         throw new Error("ID встречи не может быть пустым");
    //     }
    
    //     const token = localStorage.getItem('userToken');
    //     if (!token) {
    //         console.error("Ошибка: Токен отсутствует!");
    //         throw new Error("Необходимо войти в систему.");
    //     }
    
    //     try {
    //         const formattedStartAt = new Date(startAt).toISOString();
    //         const formattedEndAt = new Date(endAt).toISOString();
    
    //         const response = await apiClient.post(
    //             `/api/booking/${uuid}/update`,
    //             { startAt: formattedStartAt, endAt: formattedEndAt },
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${token}`,
    //                     'Accept': 'application/json',
    //                 }
    //             }
    //         );
    
    //         return response.data;
    //     } catch (error) {
    //         console.error("Ошибка при обновлении встречи:", error.response?.data || error.message);
    //         throw error;
    //     }
    // }
    updateMeeting: async ({uuid, startAt, endAt}) => {
        try {
            const token = localStorage.getItem('userToken');
    
            const payload = {
                startAt,
                endAt,
            };
    
            console.log("Отправляемые данные:", payload);
    
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
    }
    
}