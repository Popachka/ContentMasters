import React, {useState} from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import LeftList from "../../components/LeftList";
import Footer from "../../components/Footer";
import ArticleConstructor from "../../components/ArticleConstructor";
import ArticleDetail from "../../components/ArticleDetail";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { id } = useParams(); // Получаем ID статьи из URL
  const [refreshArticles, setRefreshArticles] = useState(false);

  // Функция для триггера обновления статей
  const handleArticleCreated = () => {
    setRefreshArticles(!refreshArticles); // Инвертируем значение, чтобы перезагрузить статьи
  };
  return (
    <div className="flex flex-col  bg-gray-100">
      <Header />

      {/* Кнопка перехода к ролям */}
      <div className="py-4 px-4">
        <Link to="/roles">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-500 transition">
            Ваши роли
          </button>
        </Link>
      </div>

      {/* Основной контент */}
      <div className="flex flex-grow py-5 px-4">
        <LeftList refresh={refreshArticles} />
        <div className="flex-1">
          {id ? <ArticleDetail onArticleCreated={handleArticleCreated}/> : <ArticleConstructor onArticleCreated={handleArticleCreated} />}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
