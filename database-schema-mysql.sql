-- MetaLib Shop - MySQL Database Schema
-- Created: 2025-11-29
-- Database: MySQL 5.7+

-- Drop tables if exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `verification_tokens`;
DROP TABLE IF EXISTS `transactions`;
DROP TABLE IF EXISTS `ticket_messages`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `users`;

-- Users table
CREATE TABLE `users` (
  `id` VARCHAR(191) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255),
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `balance` DECIMAL(10,2) DEFAULT 0.00,
  `email_verified` BOOLEAN DEFAULT FALSE,
  `two_factor_enabled` BOOLEAN DEFAULT FALSE,
  `two_factor_secret` VARCHAR(255),
  `referral_code` VARCHAR(50) UNIQUE,
  `referred_by` VARCHAR(191),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_referral_code` (`referral_code`),
  INDEX `idx_users_referred_by` (`referred_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions table
CREATE TABLE `sessions` (
  `id` VARCHAR(191) PRIMARY KEY,
  `session_token` VARCHAR(255) NOT NULL UNIQUE,
  `user_id` VARCHAR(191) NOT NULL,
  `expires` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_sessions_user_id` (`user_id`),
  INDEX `idx_sessions_session_token` (`session_token`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE `categories` (
  `id` VARCHAR(191) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `icon` VARCHAR(255),
  `active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_categories_slug` (`slug`),
  INDEX `idx_categories_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE `products` (
  `id` VARCHAR(191) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2),
  `image` VARCHAR(500),
  `category_id` VARCHAR(191),
  `stock` INT DEFAULT 0,
  `digital_content` TEXT,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `external_id` VARCHAR(255),
  `source` VARCHAR(50),
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_slug` (`slug`),
  INDEX `idx_products_category_id` (`category_id`),
  INDEX `idx_products_is_active` (`is_active`),
  INDEX `idx_products_is_featured` (`is_featured`),
  INDEX `idx_products_external_id` (`external_id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE `orders` (
  `id` VARCHAR(191) PRIMARY KEY,
  `user_id` VARCHAR(191) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
  `payment_method` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_user_id` (`user_id`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Items table
CREATE TABLE `order_items` (
  `id` VARCHAR(191) PRIMARY KEY,
  `order_id` VARCHAR(191) NOT NULL,
  `product_id` VARCHAR(191),
  `product_name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `digital_content` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_items_order_id` (`order_id`),
  INDEX `idx_order_items_product_id` (`product_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE `settings` (
  `id` VARCHAR(191) PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  `value` TEXT,
  `type` VARCHAR(50) DEFAULT 'string',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_settings_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tickets table
CREATE TABLE `tickets` (
  `id` VARCHAR(191) PRIMARY KEY,
  `user_id` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `status` ENUM('open', 'in_progress', 'closed') DEFAULT 'open',
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tickets_user_id` (`user_id`),
  INDEX `idx_tickets_status` (`status`),
  INDEX `idx_tickets_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ticket Messages table
CREATE TABLE `ticket_messages` (
  `id` VARCHAR(191) PRIMARY KEY,
  `ticket_id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `is_admin` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ticket_messages_ticket_id` (`ticket_id`),
  INDEX `idx_ticket_messages_user_id` (`user_id`),
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Transactions table
CREATE TABLE `transactions` (
  `id` VARCHAR(191) PRIMARY KEY,
  `user_id` VARCHAR(191) NOT NULL,
  `type` ENUM('deposit', 'withdrawal', 'purchase', 'refund', 'referral_bonus') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  `description` VARCHAR(500),
  `payment_method` VARCHAR(50),
  `external_id` VARCHAR(255),
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_transactions_user_id` (`user_id`),
  INDEX `idx_transactions_type` (`type`),
  INDEX `idx_transactions_status` (`status`),
  INDEX `idx_transactions_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verification Tokens table
CREATE TABLE `verification_tokens` (
  `id` VARCHAR(191) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `expires` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_verification_tokens_email` (`email`),
  INDEX `idx_verification_tokens_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Favorites table
CREATE TABLE `favorites` (
  `id` VARCHAR(191) PRIMARY KEY,
  `user_id` VARCHAR(191) NOT NULL,
  `product_id` VARCHAR(191) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_favorites_user_id` (`user_id`),
  INDEX `idx_favorites_product_id` (`product_id`),
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO `settings` (`id`, `key`, `value`, `type`) VALUES
('set_1', 'site_name', 'MetaLib Shop', 'string'),
('set_2', 'site_description', 'Digital products marketplace', 'string'),
('set_3', 'currency', 'RUB', 'string'),
('set_4', 'min_deposit', '100', 'number'),
('set_5', 'max_deposit', '50000', 'number'),
('set_6', 'referral_bonus', '50', 'number'),
('set_7', 'referral_percentage', '5', 'number');

-- Insert default categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `icon`, `active`, `sort_order`) VALUES
('cat_1', 'Steam Games', 'steam-games', 'Digital Steam game keys', '🎮', TRUE, 1),
('cat_2', 'Gift Cards', 'gift-cards', 'Digital gift cards', '🎁', TRUE, 2),
('cat_3', 'Software', 'software', 'Software licenses', '💻', TRUE, 3),
('cat_4', 'Subscriptions', 'subscriptions', 'Service subscriptions', '📺', TRUE, 4);
