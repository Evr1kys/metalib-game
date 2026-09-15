-- API Keys для реселлеров
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(191) PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  permissions JSON,
  is_active TINYINT(1) DEFAULT 1,
  last_used_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_key_hash (key_hash),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Логи API запросов
CREATE TABLE IF NOT EXISTS api_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_key_id VARCHAR(191) NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  response_time INT,
  created_at DATETIME NOT NULL,
  INDEX idx_api_key (api_key_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица элементов заказа (если ещё не существует)
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(191) PRIMARY KEY,
  order_id VARCHAR(191) NOT NULL,
  product_id VARCHAR(191) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
