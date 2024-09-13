import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
const ArticleConstructor = ({onArticleCreated}) => {
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [length, setLength] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false); // Для отображения индикатора загрузки
  const [articleId, setArticleId] = useState(null); // Для хранения ID статьи

  const models = ["YandexGPT-lite"]; // Пример моделей

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/avatars/");
        setRoles(response.data.data); // Предполагаем, что роли хранятся в response.data.data
      } catch (error) {
        console.error("Ошибка при получении ролей", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleModelSelection = (model) => {
    setSelectedModel(model);
  };

  const handleGenerateArticle = async () => {
    if (!topic || !keywords || !selectedModel || !role) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }
    setGenerating(true);

    // Формируем параметры для строки запроса
    let query = `?avatar_id=${role}&model=${selectedModel}&theme=${encodeURIComponent(
      topic
    )}&key_words=${encodeURIComponent(keywords)}`;

    // Добавляем параметр длины, если он введен
    if (length) {
      query += `&len_article=${Number(length)}`;
    }

    try {
      // Отправляем GET-запрос с параметрами в строке запроса
      const response = await axiosInstance.get(`/article/generate${query}`);

      // После успешной генерации статьи, сервер вернет ID статьи
      const articleId = response.data.id;
      setArticleId(articleId);
      onArticleCreated()
      // Переходим на страницу статьи, используя числовой ID
      navigate(`/${articleId}`);
    } catch (error) {
      console.error("Ошибка при генерации статьи", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-5/6 bg-white p-6 ml-4 rounded-lg shadow-md border">
      <h2 className="text-xl font-semibold mb-4">Конструктор статей</h2>
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner overflow-y-auto space-y-6">
        {/* Выбор модели */}
        <div>
          <label className="block text-gray-700 mb-2">Выберите модель:</label>
          <div className="flex flex-wrap gap-2">
            {models.map((model, idx) => (
              <button
                key={idx}
                onClick={() => handleModelSelection(model)}
                className={`py-2 px-4 rounded-md ${
                  selectedModel === model
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-indigo-500 transition`}
              >
                {model}
              </button>
            ))}
          </div>
          <p className="mt-2 text-gray-600">Вы выбрали: {selectedModel}</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-2">Тема статьи:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Введите тему статьи"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 mb-2">Ключевые слова:</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Введите ключевые слова"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-2">Роль:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            >
              <option value="">Выберите роль</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 mb-2">
              Длина статьи (слов):
            </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Введите длину статьи"
              className="w-32 p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateArticle}
          className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition"
        >
          Сгенерировать статью
        </button>

        {generating && (
          <p className="mt-4 text-indigo-600">Генерация статьи, подождите... Она может занять несколько секунд до минуты</p>
        )}
      </div>
    </div>
  );
};

export default ArticleConstructor;
