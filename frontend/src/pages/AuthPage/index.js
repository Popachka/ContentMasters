import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance'; // Импортируйте настроенный экземпляр axios
import Header from '../../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await axiosInstance.post(
        'login/access-token',
        new URLSearchParams({
          grant_type: 'password',
          username: email,
          password: password
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
  
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token); // Сохраните токен в localStorage
      login(access_token);
      navigate('/'); // Переход на главную страницу после успешного входа
    } catch (error) {
      setError('Ошибка при входе. Пожалуйста, проверьте ваши данные и попробуйте снова.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex justify-center items-center bg-gray-100">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">Вход в аккаунт</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Введите ваш email"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">Пароль</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                placeholder="Введите ваш пароль"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300"
            >
              Войти
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-indigo-600 hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
