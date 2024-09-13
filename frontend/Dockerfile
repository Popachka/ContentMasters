# Используйте официальный образ Node.js как базовый
FROM node:18

# Установите рабочую директорию
WORKDIR /app

# Копируйте package.json и package-lock.json
COPY package*.json ./

# Установите зависимости
RUN npm install

# Копируйте все файлы в контейнер
COPY . .

# Соберите приложение
RUN npm run build

# Определите порт, который будет использоваться
EXPOSE 3000

# Запустите приложение
CMD ["npm", "start"]
