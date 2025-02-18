import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:999/',
    timeout: 100000,
});



export const setupInterceptors = (showLoading, showError, showLoaded, showSuccess) => {
    const requestInterceptorId = axiosInstance.interceptors.request.use(
        (config) => {
            showLoading('loading');
            config.headers = {
                "Accept": "application/json",
                "Content-Type": config.headers['Content-Type'] || "application/json",
                "token-owner": localStorage.getItem('key'),
            };
            config.metadata = { startTime: new Date() };
            return config;
        },
        (error) => {
            showError('Request failed.');
            return Promise.reject(error);
        }
    );

    const responseInterceptorId = axiosInstance.interceptors.response.use(
        (response) => {
            if (response.data.message === "Token timeout or error") {
                showError('Token timeout or error');
                localStorage.removeItem('key');
                window.location.href = '#/login';
            }
            showSuccess('Operation successful!', 'loading');
            return response;
        },
        (error) => {
            showLoaded();
            return Promise.reject(error);
        }
    );

    return () => {
        axiosInstance.interceptors.request.eject(requestInterceptorId);
        axiosInstance.interceptors.response.eject(responseInterceptorId);
    };
};

export default axiosInstance;
