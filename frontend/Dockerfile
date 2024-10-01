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

# Используйте Nginx для обслуживания собранных файлов
FROM nginx:alpine

# Копируйте собранные файлы из предыдущего этапа
COPY --from=build /app/build /usr/share/nginx/html

# Копируйте вашу конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
