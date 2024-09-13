// src/api/auth.js
import axiosInstance from './axiosInstance';

export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { access_token } = response.data;

    // Сохраните токен в localStorage
    localStorage.setItem('access_token', access_token);

    return response.data;
  } catch (error) {
    throw new Error('Ошибка авторизации');
  }
};
