import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveAs } from "file-saver";

const ArticleDetail = ({onArticleCreated}) => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Состояние для переключения режима редактирования
  const [editName, setEditName] = useState(""); // Состояние для хранения нового названия
  const [editContent, setEditContent] = useState(""); // Состояние для хранения нового содержимого
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
                <h1 className="text-2xl font-semibold mb-4">
                  Редактирование статьи
                </h1>
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

                <h1 className="text-2xl font-semibold mb-4">{article.name}</h1>
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
                </div>
                </div>
              </>
            )}
          </>
        ) : (
          <p>Статья не найдена.</p>
        )}
      </div>
  );
};

export default ArticleDetail;
