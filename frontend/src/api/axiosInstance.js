// src/api/axiosInstance.js
import axios from 'axios';

// Создайте экземпляр Axios с базовым URL
const axiosInstance = axios.create({
  // baseURL: 'https://spichkintut.ru/api/v1/', // Замените на URL вашего бэкенда
  baseURL: 'http://localhost:8888/api/v1/'
});

// Добавьте обработчик запроса для установки заголовков авторизации
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавьте обработчик ответа для обработки ошибок
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок, таких как 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      // Возможно, можно выполнить logout или перенаправить пользователя
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
