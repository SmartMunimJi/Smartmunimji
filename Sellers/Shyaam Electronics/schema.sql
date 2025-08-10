CREATE DATABASE shyaam_electronics_db;

USE shyaam_electronics_db;

CREATE TABLE `seller_orders` (
    `order_id` VARCHAR(100) NOT NULL PRIMARY KEY,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_phone_number` VARCHAR(20) NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `product_price` DECIMAL(10, 2) NOT NULL,
    `date_of_purchase` DATE NOT NULL,
    `warranty_period_months` INT NOT NULL,
    `seller_internal_product_sku` VARCHAR(100) NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_order_phone` (`order_id`, `customer_phone_number`)
);
