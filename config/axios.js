import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://crave-server-main.onrender.com',
  timeout: 15000,
});

export default axiosInstance;