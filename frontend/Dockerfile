# Этап сборки
FROM node:20-alpine AS builder

# Включаем Corepack для поддержки Yarn 4
RUN corepack enable

WORKDIR /app

# Копируем файлы конфигурации пакетного менеджера
COPY package.json yarn.lock .yarnrc.yml ./

# Устанавливаем зависимости
RUN yarn install --immutable

# Копируем исходный код
COPY . .

# Собираем проект
RUN yarn build

# Продакшн этап
FROM nginx:alpine

# Копируем собранные файлы из этапа сборки
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx для SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
