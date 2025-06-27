# CodeIO
Веб-платформа для спортивного программирования, разработанная в рамках курсового проекта по дисциплине "Разработка веб-приложений" [https://codeio.grebennikov.su](https://codeio.grebennikov.su)

# Локальный запуск
Для локального запуска создайте `.local.env` в соответствии с .`template.env`. Далее запустите команду
```
docker-compose -f docker-compose.local.yaml --env-file .local.env up --build
```
флаг --env-file важен, так как он задает файл для интерполяции (${} синтаксис в docker-compose.yaml), иначе всегда будет использоватсья .env
