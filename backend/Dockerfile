# Используем официальный Python образ
FROM python:3.10-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем и устанавливаем зависимости
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Задаем переменную окружения
ENV PYTHONPATH=/app

# Копируем исходный код и скрипты
COPY ./app /app/app
COPY ./prestart.sh /app/
COPY ./alembic.ini /app/
COPY ./scripts/ /app/
COPY ./tests-start.sh /app/
COPY ./start-reload.sh /
COPY ./clear_bd.sh /app/
COPY ./create_migrate.sh /app/  
COPY ./migrate.sh /app/
COPY ./run.sh /app/

# Устанавливаем права на выполнение скриптов
RUN chmod +x /app/prestart.sh
RUN chmod +x /app/run.sh        