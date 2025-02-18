import { useEffect } from 'react';
import { useMessage } from '../provider/MessageProvider.jsx';
import axiosInstance, { setupInterceptors } from './useAxios.js';

export const useAxiosSetup = () => {
    const { showError, showLoading, showLoaded, showSuccess } = useMessage();

    useEffect(() => {
        const cleanup = setupInterceptors(showLoading, showError, showLoaded, showSuccess);

        return cleanup;
    }, [showLoading, showError, showLoaded, showSuccess]);

    return axiosInstance;
};
