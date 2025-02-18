import axios from 'axios';
import * as receipt from './receipt';
import * as global from './global';
import * as category from './category';
import * as order from './order';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'fandbsoft.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('key');
    if (token) {
      config.headers = {
        ...config.headers,
        'token-owner': token,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export { receipt, global, category, order };
export default API;