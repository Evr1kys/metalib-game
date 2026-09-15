-- Создание расширений PostgreSQL (если нужно)
-- Выполните эти команды в phpMyAdmin или psql ДО запуска миграций

-- UUID расширение (для генерации ID)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================
-- SQL команды для создания базы данных и пользователя
-- Выполните в phpMyAdmin или через SSH в psql
-- ===================================================

-- 1. Создание базы данных (обычно через cPanel интерфейс)
-- CREATE DATABASE metalib_shop;

-- 2. Создание пользователя (обычно через cPanel интерфейс)
-- CREATE USER dbuser WITH PASSWORD 'ваш_надежный_пароль';

-- 3. Выдача прав пользователю
-- GRANT ALL PRIVILEGES ON DATABASE metalib_shop TO dbuser;

-- 4. Дополнительные права для схемы public
-- GRANT ALL PRIVILEGES ON SCHEMA public TO dbuser;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbuser;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbuser;

-- ===================================================
-- После создания БД и пользователя:
-- ===================================================
-- 1. Обновите DATABASE_URL в .env файле:
--    DATABASE_URL="postgresql://dbuser:пароль@localhost:5432/metalib_shop"
--
-- 2. Запустите миграции Prisma:
--    npx prisma migrate deploy
--
-- 3. Создайте первого админа:
--    node scripts/init-admin.js
-- ===================================================

-- Проверка подключения (выполните в psql)
-- \c metalib_shop
-- \dt  -- показать все таблицы
-- SELECT * FROM users LIMIT 5;  -- проверить данные
