-- Миграция для добавления новых полей
-- Дата: 2025-11-29
-- Описание: Добавление поддержки уведомлений о снижении цен, архивации тикетов и медиа вложений

-- 1. Добавляем поле для отслеживания цен в избранном
ALTER TABLE `favorites` ADD COLUMN `last_notified_price` DECIMAL(10, 2) NULL AFTER `product_id`;

-- 2. Добавляем поля для архивации тикетов
ALTER TABLE `tickets` ADD COLUMN `is_archived` BOOLEAN NOT NULL DEFAULT FALSE AFTER `updated_at`;
ALTER TABLE `tickets` ADD COLUMN `archived_at` DATETIME NULL AFTER `is_archived`;

-- 3. Добавляем поле для вложений в сообщениях тикетов
ALTER TABLE `ticket_messages` ADD COLUMN `attachments` TEXT NULL AFTER `message`;

-- Создаем индексы для улучшения производительности
CREATE INDEX `idx_favorites_last_notified_price` ON `favorites`(`last_notified_price`);
CREATE INDEX `idx_tickets_is_archived` ON `tickets`(`is_archived`);
CREATE INDEX `idx_tickets_archived_at` ON `tickets`(`archived_at`);
