-- UrbanThread Database Schema
-- Run this on a fresh Railway MySQL database to initialize all tables.
-- After running this, run: npm run seed && npm run seed:admin  (in backend/)
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `urbanthread_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `urbanthread_db`;

-- 1. categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. products
CREATE TABLE IF NOT EXISTS `products` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price`       DECIMAL(10, 2) NOT NULL,
  `image_url`   VARCHAR(1000),
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. product_variants
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `size`       VARCHAR(50) NOT NULL,
  `colour`     VARCHAR(50) NOT NULL,
  `stock`      INT NOT NULL DEFAULT 0,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. users
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(255) NOT NULL,
  `email`         VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone`         VARCHAR(50),
  `address`       TEXT,
  `city`          VARCHAR(100),
  `role`          ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`          INT NULL,
  `customer_name`    VARCHAR(255) NOT NULL,
  `customer_email`   VARCHAR(255) NOT NULL,
  `customer_phone`   VARCHAR(30) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `shipping_city`    VARCHAR(100) NOT NULL,
  `notes`            TEXT,
  `subtotal`         DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `delivery_fee`     DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total`            DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `payment_method`   ENUM('whatsapp', 'payhere', 'cash_on_delivery') NOT NULL,
  `payment_status`   ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `order_status`     ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_orders_user_id`         (`user_id`),
  INDEX `idx_orders_customer_email`  (`customer_email`),
  INDEX `idx_orders_order_status`    (`order_status`),
  INDEX `idx_orders_payment_status`  (`payment_status`),
  INDEX `idx_orders_created_at`      (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `order_id`     INT NOT NULL,
  `product_id`   INT NOT NULL,
  `variant_id`   INT NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `size`         VARCHAR(50) NOT NULL,
  `colour`       VARCHAR(50) NOT NULL,
  `unit_price`   DECIMAL(12, 2) NOT NULL,
  `quantity`     INT NOT NULL,
  `subtotal`     DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (`order_id`)   REFERENCES `orders`(`id`)          ON DELETE CASCADE  ON UPDATE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)        ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_order_items_order_id`   (`order_id`),
  INDEX `idx_order_items_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
