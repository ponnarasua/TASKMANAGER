import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;

            if (status === 401) {
                // Let the context handle redirect and logout
                localStorage.removeItem('token'); // clear invalid token
            } else if (status === 500) {
                alert('Internal server error. Please try again later.');
            }
        } else if (error.code === 'ECONNABORTED') {
            alert('Request timed out. Please check your internet connection and try again.');
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
