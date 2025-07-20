import axios from 'axios';
import { BASE_URL } from './apiPaths';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Include credentials (cookies) in request
});

//Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    
},
    (error) => {
        return Promise.reject(error);
    }
);

//Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors globally
        if(error.response){
            if(error.response.status === 401){
                // Redirect to login page
                window.location.href = '/login';
            }else if(error.response.status === 500){
                // Handle server error
                alert('Internal server error. Please try again later.');
            }
        }else if(error.code === 'ECONNABORTED'){
            // Handle network error
            alert('Request timed out. Please check your internet connection and try again.');
        }
        return Promise.reject(error);
    }
);
    
export default axiosInstance;