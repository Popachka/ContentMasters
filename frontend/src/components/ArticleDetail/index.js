import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveAs } from "file-saver";
import Modal from 'react-modal';

const ArticleDetail = ({ onArticleCreated }) => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false); // Состояние для открытия модального окна анализа
  const [analysisLoading, setAnalysisLoading] = useState(false); // Состояние загрузки анализа
  const [analysisData, setAnalysisData] = useState(null); // Данные анализа
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axiosInstance.get(`article/${id}`);
        setArticle(response.data);
        setEditName(response.data.name);
        setEditContent(response.data.content);
      } catch (error) {
        console.error("Ошибка при получении статьи:", error);
        setError("Ошибка при загрузке статьи");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`article/${id}`);
      onArticleCreated()
      navigate("/");
    } catch (error) {
      console.error("Ошибка при удалении статьи:", error);
      setError("Ошибка при удалении статьи");
    }
  };

  const handleUpdate = async () => {
    try {
      await axiosInstance.put(`article/${id}`, {
        name: editName,
        content: editContent,
      });
      setArticle((prev) => ({ ...prev, name: editName, content: editContent }));
      onArticleCreated()
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка при обновлении статьи:", error);
      setError("Ошибка при обновлении статьи");
    }
  };

  const exportToMarkdown = (article) => {
    const markdownContent = `# ${article.name}\n\n${article.content}`;
    const blob = new Blob([markdownContent], {
      type: "text/markdown;charset=utf-8",
    });
    saveAs(blob, `${article.name}.md`);
  };

  const exportToHTML = (article) => {
    const htmlContent = `
      <html>
        <head>
          <title>${article.name}</title>
        </head>
        <body>
          <h1>${article.name}</h1>
          <div>${article.content}</div>
        </body>
      </html>`;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    saveAs(blob, `${article.name}.html`);
  };

  const analyzeText = async () => {
    setAnalysisLoading(true); // Устанавливаем состояние загрузки
    setIsAnalysisOpen(true); // Открываем модальное окно

    try {
      const response = await axiosInstance.get(`article/analyze_text`, {
        params: { article_text: article.content }
      });
      setAnalysisData(response.data);
    } catch (error) {
      console.error("Ошибка при анализе текста:", error);
      setError("Ошибка при анализе текста");
    } finally {
      setAnalysisLoading(false); // Отключаем состояние загрузки
    }
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="flex flex-col bg-gray-100">
      {article ? (
        <>
          {isEditing ? (
            <div className="max-w-7xl  bg-white p-6 rounded-lg shadow-md border">
              <div className="max-w-7xl">
                <h1 className="text-2xl font-semibold mb-4">Редактирование статьи</h1>
                <div className="mb-4">
                  <label className="block mb-2">Название</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border px-2 py-1 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2">Содержимое</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="border px-2 py-1 w-full"
                    rows="20"
                  />
                </div>
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-500 transition"
                >
                  Сохранить изменения
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-500 transition ml-2"
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md border">
                <p className="border mb-5">
                Изначальное название статьи:
                <h1 className="text-xl font-semibold mb-4 "> {article.name}</h1>
                </p>
                <div className="prose lg:prose-xl">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.content}
                  </ReactMarkdown>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-500 transition"
                  >
                    Удалить статью
                  </button>
                  <button
                    onClick={() => exportToMarkdown(article)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-500 transition ml-2"
                  >
                    Экспорт в Markdown
                  </button>
                  <button
                    onClick={() => exportToHTML(article)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-500 transition ml-2"
                  >
                    Экспорт в HTML
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-500 transition ml-2"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={analyzeText}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-500 transition ml-2"
                  >
                    Показать аналитику
                  </button>
                </div>
              </div>

              {/* Модальное окно анализа текста */}
              <Modal
                isOpen={isAnalysisOpen}
                onRequestClose={() => setIsAnalysisOpen(false)}
                contentLabel="Анализ текста"
                className="bg-white rounded-lg p-6 max-w-lg mx-auto mt-10 shadow-lg border"
                overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-50"
              >
                <h2 className="text-2xl font-semibold mb-4">Анализ текста</h2>
                {analysisLoading ? (
                  <p>Идет анализ текста...</p>
                ) : analysisData ? (
                  <div>
                    <h3 className="text-xl font-semibold">Ключевые слова 
                      <br></br>(не учитываем похожие слова, по словообразованию)</h3>
                    <ul>
                      {analysisData.keywords.map((keyword, index) => (
                        <li key={index}>
                          {keyword.word} — ({keyword['count']} раз)
                        </li>
                      ))}
                    </ul>
                    <h3 className="text-xl font-semibold mt-4">Общая длина текста</h3>
                    <p>Символы: {analysisData.statistics.num_characters}</p>
                    <p>Слова: {analysisData.statistics.num_words}</p>
                  </div>
                ) : (
                  <p>Ошибка при анализе текста.</p>
                )}
                <button
                  onClick={() => setIsAnalysisOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-500 transition mt-4"
                >
                  Закрыть
                </button>
              </Modal>
            </>
          )}
        </>
      ) : (
        <p>Статья не найдена</p>
      )}
    </div>
  );
};

export default ArticleDetail;
