// src/api/userApi.js
import axiosInstance from './axiosInstance'; // Ваш экземпляр axios

export const fetchUserData = async () => {
  try {
    const response = await axiosInstance.get('users/me');
    return response.data; // Возвращаем данные о пользователе
  } catch (error) {
    throw error; // Если произошла ошибка, выбрасываем её для обработки в компоненте
  }
};
