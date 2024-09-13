import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance"; // Импортируйте ваш экземпляр Axios
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const RolesCreate = () => {
  const { id } = useParams(); // Получаем ID из URL
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [keyWords, setKeyWords] = useState("");
  const [domain, setDomain] = useState("");
  const [tone, setTone] = useState("");
  const [isEdit, setIsEdit] = useState(false); // Для отслеживания режима редактирования
  const [isGlobal, setIsGlobal] = useState(false); // Для хранения флага глобальной роли

  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Если есть ID, то это режим редактирования
      setIsEdit(true);
      const fetchRole = async () => {
        try {
          const response = await axiosInstance.get(`/avatars/${id}`);
          const role = response.data;
          console.log(role);
          setName(role.name);
          setDescription(role.description);
          setKeyWords(role.key_words);
          setDomain(role.domain);
          setTone(role.tone);
          setIsGlobal(role.is_global); // Устанавливаем флаг глобальной роли
        } catch (error) {
          console.error("Ошибка при получении данных роли:", error);
        }
      };

      fetchRole();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEdit) {
        // Обновление существующей роли
        await axiosInstance.put(`/avatars/${id}`, {
          name,
          description,
          key_words: keyWords,
          domain,
          tone,
        });
      } else {
        // Создание новой роли
        await axiosInstance.post("/avatars/personal/", {
          name,
          description,
          key_words: keyWords,
          domain,
          tone,
        });
      }

      // После успешного создания или обновления роли перенаправляем на страницу списка ролей
      navigate("/roles");
    } catch (error) {
      console.error("Ошибка при создании/обновлении роли:", error);
      // Можно добавить обработку ошибки, например, показать уведомление пользователю
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Вы уверены, что хотите удалить эту роль?")) {
      try {
        await axiosInstance.delete(`/avatars/${id}`);
        navigate("/roles");
      } catch (error) {
        console.error("Ошибка при удалении роли:", error);
        // Можно добавить обработку ошибки, например, показать уведомление пользователю
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex-grow py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-indigo-600 hover:text-indigo-700 focus:outline-none"
          >
            ← Назад
          </button>

          <h1 className="text-3xl font-semibold mb-8 text-gray-800">
            {isEdit ? "Редактирование роли" : "Создание новой роли"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Имя личности
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isGlobal} // Устанавливаем disabled в true, если isGlobal
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm 
      ${
        isGlobal
          ? "bg-gray-200 cursor-not-allowed"
          : "focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50"
      } 
      transition duration-150 ease-in-out`}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Биография/Описание
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="8"
                disabled={isGlobal} // Устанавливаем disabled в true, если isGlobal
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm 
      ${
        isGlobal
          ? "bg-gray-200 cursor-not-allowed"
          : "focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50"
      } 
      transition duration-150 ease-in-out`}
              />
            </div>
            <div>
              <label
                htmlFor="keyWords"
                className="block text-sm font-medium text-gray-700"
              >
                Его любимые слова
              </label>
              <input
                type="text"
                id="keyWords"
                value={keyWords}
                onChange={(e) => setKeyWords(e.target.value)}
                required
                disabled={isGlobal} // Устанавливаем disabled в true, если isGlobal
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm 
      ${
        isGlobal
          ? "bg-gray-200 cursor-not-allowed"
          : "focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50"
      } 
      transition duration-150 ease-in-out`}
              />
            </div>
            <div>
              <label
                htmlFor="domain"
                className="block text-sm font-medium text-gray-700"
              >
                Специализация
              </label>
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
                disabled={isGlobal} // Устанавливаем disabled в true, если isGlobal
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm 
      ${
        isGlobal
          ? "bg-gray-200 cursor-not-allowed"
          : "focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50"
      } 
      transition duration-150 ease-in-out`}
              />
            </div>
            <div>
              <label
                htmlFor="tone"
                className="block text-sm font-medium text-gray-700"
              >
                Формат разговора
              </label>
              <input
                type="text"
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                required
                disabled={isGlobal} // Устанавливаем disabled в true, если isGlobal
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm 
      ${
        isGlobal
          ? "bg-gray-200 cursor-not-allowed"
          : "focus:border-indigo-600 focus:ring focus:ring-indigo-600 focus:ring-opacity-50"
      } 
      transition duration-150 ease-in-out`}
              />
            </div>

            <div className="flex justify-end space-x-4">
              {!isGlobal && ( // Скрываем кнопку удаления, если роль глобальная
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-md shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out"
                  disabled={isGlobal} // Отключаем кнопку, если роль глобальная
                >
                  {isEdit ? "Обновить роль" : "Создать роль"}
                </button>
              )}

              {isEdit &&
                !isGlobal && ( // Скрываем кнопку удаления, если роль глобальная
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-5 py-2.5 rounded-md shadow-md hover:bg-red-700 transition duration-150 ease-in-out"
                  >
                    Удалить роль
                  </button>
                )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RolesCreate;
