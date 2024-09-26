import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const ArticleConstructor = ({ onArticleCreated }) => {
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [length, setLength] = useState("4096");
  const [selectedModel, setSelectedModel] = useState("");
  const [roles, setRoles] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [articleId, setArticleId] = useState(null);
  const [globalRoleIds, setGlobalRoleIds] = useState([]);
  const [isGlobalRole, setIsGlobalRole] = useState(false);
  const [goal, setGoal] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const globalResponse = await axiosInstance.get("/avatars/global");
        const globalRoles = globalResponse.data.data;
        const globalIds = globalRoles.map(role => role.id);
        setGlobalRoleIds(globalIds);
  
        const userResponse = await axiosInstance.get("/avatars/");
        const userRoles = userResponse.data.data;
  
        setRoles([...globalRoles, ...userRoles]);
      } catch (error) {
        console.error("Ошибка при получении ролей", error);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchModels = async () => {
      try {
        const response = await axiosInstance.get("/article/active_models");
        const fetchedModels = response.data.models;
        setModels(fetchedModels);
        
        // Set the first model as the default selected model
        if (fetchedModels.length > 0) {
          setSelectedModel(fetchedModels[0]); // Set the first model as default
        }
      } catch (error) {
        console.error("Ошибка при получении моделей", error);
      }
    };
  
    fetchRoles();
    fetchModels();
  }, []);

  const handleModelSelection = (model) => setSelectedModel(model);

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setIsGlobalRole(globalRoleIds.includes(selectedRole));
  };

  const handleGenerateArticle = async () => {
    if (!topic || !selectedModel || !role) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    let lengthNum = Number(length);
    let keywordsToUse = keywords;

    if (isGlobalRole) {
      lengthNum = 12000;
      keywordsToUse = topic;
    } else {
      if (lengthNum < 4096 || lengthNum > 120000) {
        alert("Длина статьи должна быть от 4096 до 120000 токенов.");
        return;
      }
    }

    setGenerating(true);

    let query = `?avatar_id=${role}&model=${selectedModel}&theme=${encodeURIComponent(
      topic
    )}&key_words=${encodeURIComponent(keywordsToUse)}&len_article=${lengthNum}`;

    if (goal) query += `&goal=${encodeURIComponent(goal)}`;

    try {
      const response = await axiosInstance.get(`/article/generate${query}`);
      setArticleId(response.data.id);
      onArticleCreated();
      navigate(`/${response.data.id}`);
    } catch (error) {
      console.error("Ошибка при генерации статьи", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border">
      
      {/* Banner */}
      <div className="bg-indigo-100 text-indigo-800 p-4 rounded-md mb-6">
        <strong>Советую сгенерировать статью с кодом 🤗</strong>
        
      </div>

      <h2 className="text-2xl font-semibold mb-4">Конструктор статей</h2>
      <div className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-6">

        {/* Model Selection */}
        <div>
          <label className="block text-gray-700 mb-2">🤖 Выберите модель:</label>
          <div className="flex flex-wrap gap-2">
            {models.map((model, idx) => (
              <button
                key={idx}
                onClick={() => handleModelSelection(model)}
                className={`py-2 px-4 rounded-md transition ${selectedModel === model ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-indigo-500"}`}
              >
                {model}
              </button>
            ))}
          </div>
          <p className="mt-2 text-gray-600">Вы выбрали: <strong>{selectedModel}</strong></p>
        </div>

        {/* Topic and Keywords */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-2">📖 Тема статьи:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Бинарный поиск на Python"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            />
            <p className="mt-1 text-sm text-gray-500">
              Основная тема статьи
            </p>
          </div>
          {!isGlobalRole && (
            <div className="flex-1">
              <label className="block text-gray-700 mb-2">✎ Ключевые слова:</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Python, algorithm, binary search"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              />
              <p className="mt-1 text-sm text-gray-500">
                Укажите ключевые слова, чтобы помочь в поиске актуальной информации.
              </p>
            </div>
          )}
        </div>

        {/* Role and Length */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700 mb-2">🦹‍♀️ Роль:</label>
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
            >
              <option value="">Выберите роль</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {globalRoleIds.includes(role.id) ? `${role.name} (известная личность)` : role.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Свои роли и известные личности
            </p>
          </div>
          {!isGlobalRole && (
            <div className="flex-1">
              <label className="block text-gray-700 mb-2">
              🔢 Длина статьи (в токенах):
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Введите длину статьи"
                min="4096"
                max="120000"
                className="w-32 p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              />
              <p className="mt-1 text-sm text-gray-500">
                (мин. 4096, макс. 120000)
              </p>
            </div>
          )}
        </div>

        {/* Additional fields for Global Roles */}
        {isGlobalRole && (
          <div>
            <h3 className="text-lg font-semibold mt-4">Дополнительные поля для глобальной роли</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-gray-700 mb-2">⭐ Цель статьи:</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Введите цель"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                />
                <p className="mt-1 text-sm text-gray-500">
                Это может быть блог, научная статья и тд
              </p>
              </div>
            </div>
          </div>
        )}

        {/* Generate Article Button */}
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
