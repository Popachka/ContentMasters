import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Контекст для авторизации
import axiosInstance from '../../api/axiosInstance' // Ваш настроенный axios instance
import { fetchUserData } from '../../api/userData';
const Header = () => {
  const { authToken, logout } = useAuth(); // Получаем токен и функцию выхода из AuthContext
  const [userData, setUserData] = useState(null); // Для хранения данных о пользователе

  useEffect(() => {
    if (authToken) {
      const loadUserData = async () => {
        try {
          const data = await fetchUserData(); // Получаем данные через API
          setUserData(data); // Сохраняем данные пользователя
          console.log(data); // Выводим в консоль для проверки
        } catch (error) {
          console.error('Ошибка при получении данных пользователя:', error);
          logout(); // Если произошла ошибка, вызываем logout
        }
      };

      loadUserData();
    }
  }, [authToken, logout]);

  return (
    <header className="flex items-center justify-between px-10 py-5 bg-indigo-600 text-white">
      {/* Название сайта с ссылкой на главную страницу */}
      <Link to="/" className="text-2xl font-bold">
        КонтентМастер от <span className="text-yellow-300">SPICHKIN_TUT</span>
      </Link>

      {/* Если пользователь авторизован, показываем его имя и кнопку "Выход" */}
      {userData ? (
        <div className="flex gap-5 items-center">
          <span>Привет, {userData.email}!</span>
          <button
            onClick={logout}
            className="hover:underline hover:text-yellow-300 transition duration-300"
          >
            Выход
          </button>
        </div>
      ) : (
        // Если не авторизован, показываем ссылки на авторизацию и регистрацию
        <div className="flex gap-5">
          <Link
            to="/auth"
            className="hover:underline hover:text-yellow-300 transition duration-300"
          >
            Авторизация
          </Link>
          <Link
            to="/register"
            className="hover:underline hover:text-yellow-300 transition duration-300"
          >
            Регистрация
          </Link>
        </div>
      )}
    </header>
  );
};

export default Header;
