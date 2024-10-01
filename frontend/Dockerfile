# Используйте официальный образ Node.js в качестве базового
FROM node:18 AS build

# Установите рабочий каталог
WORKDIR /app

# Скопируйте файлы package.json и package-lock.json
COPY package*.json ./ 

# Установите зависимости
RUN npm install

# Скопируйте все остальные файлы приложения
COPY . . 

# Соберите ваше приложение
RUN npm run build
