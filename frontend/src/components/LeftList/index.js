import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext'; // Предполагается, что у вас есть AuthContext

// Функция для запроса статей
const fetchArticles = async () => {
  try {
    const response = await axiosInstance.get("article/");
    return response.data.data; // Предполагаем, что статьи находятся в data.data
  } catch (error) {
    console.error("Ошибка при получении статей:", error);
    throw error;
  }
};

const LeftList = ({ refresh }) => {
  const [articles, setArticles] = useState([]);
  const { authToken } = useAuth(); // Получаем токен из AuthContext
  useEffect(() => {
    if (authToken) {
      const loadArticles = async () => {
        try {
          const articlesData = await fetchArticles();
          setArticles(articlesData);
        } catch (error) {
          console.error('Ошибка при получении статей:', error);
        }
      };

      loadArticles();
    }
  }, [authToken, refresh]); // Добавили зависимость от refresh

  return (
    <div className="w-1/6 bg-gray-200 p-4 rounded-lg shadow-md">
      {/* Кнопка создания статьи */}
      <div className="mb-4">
        <Link
          to="/"
          className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-500 transition"
        >
          Создать статью
        </Link>
      </div>
      
      <h2 className="text-lg font-semibold mb-4 text-center">Список статей</h2>
      <div className="overflow-y-auto articles"> {/* Добавили скролл и ограничили высоту */}
        <ul className="space-y-3">
          {articles.map((article) => (
            <li key={article.id} className="p-3 bg-white rounded-lg shadow hover:bg-gray-100 transition">
              <Link to={`/${article.id}`} className="text-blue-600 hover:underline">
                {article.name} {/* Используем name для отображения заголовка */}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeftList;
