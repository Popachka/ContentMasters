import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance'; // Импортируйте свой экземпляр Axios
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const RolesPage = () => {
  const [roles, setRoles] = useState([]); // Состояние для хранения ролей
  const [globalRoles, setGlobalRoles] = useState([]); // Состояние для хранения глобальных ролей
  const [loading, setLoading] = useState(true); // Состояние для загрузки
  const [error, setError] = useState(null); // Состояние для ошибок

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // Количество элементов на странице

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Получение локальных ролей с пагинацией
        const localResponse = await axiosInstance.get(`avatars/?page=${currentPage}&limit=${itemsPerPage}`);
        setRoles(localResponse.data.data);
        setTotalPages(Math.ceil(localResponse.data.total / itemsPerPage)); // Установка общего количества страниц

        // Получение глобальных ролей
        const globalResponse = await axiosInstance.get('avatars/global?skip=0&limit=10');
        setGlobalRoles(globalResponse.data.data);
      } catch (error) {
        console.error('Ошибка при получении ролей:', error);
        setError('Ошибка при загрузке ролей');
      } finally {
        setLoading(false); // Завершаем состояние загрузки
      }
    };

    fetchRoles();
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  // Объединяем глобальные и локальные роли
  const combinedRoles = [...globalRoles, ...roles];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      
      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border">
          <h1 className="text-2xl font-semibold mb-4">Управление ролями</h1>

          {/* Ссылка для добавления новой роли */}
          <div className="mb-6">
            <Link
              to="./create"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-500 transition"
            >
              Добавить роль
            </Link>
          </div>
          
          {/* Список ролей */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Список ролей</h2>
            <ul className="space-y-2">
              {combinedRoles.length > 0 ? (
                combinedRoles.map((role) => (
                  <li key={role.id} className="p-2 border-b last:border-b-0">
                    <Link
                      to={`/edit/${role.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {role.name}
                    </Link>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Роли не добавлены.</p>
              )}
            </ul>
          </div>

          {/* Пагинация */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-500 transition"
            >
              Предыдущая
            </button>
            <span className="self-center">{`Страница ${currentPage} из ${totalPages ? totalPages : 1}`}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-500 transition"
            >
              Следующая
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RolesPage;
