-- -----------------------------------------------------------
-- 1. Create the Database
-- -----------------------------------------------------------

DROP DATABASE IF EXISTS ecommerce_db;
CREATE DATABASE ecommerce_db;
USE ecommerce_db;

-- -----------------------------------------------------------
-- 2. Create a Dedicated User and Grant Privileges
-- -----------------------------------------------------------

DROP USER IF EXISTS 'ecommerce_user'@'localhost';
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'StrongP@ssw0rd123!';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;

-- -----------------------------------------------------------
-- 3. Create Tables
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url VARCHAR(255),
    category VARCHAR(100),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipping_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 1),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE (user_id, product_id)
);

-- -----------------------------------------------------------
-- 4. Insert Sample Product Data (Optional for Testing)
-- -----------------------------------------------------------

INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
('Laptop Pro X', 'Powerful laptop for professionals with 16GB RAM and 512GB SSD.', 120000.00, '/uploads/laptop.jpg', 'Electronics', 50),
('Wireless Headphones', 'Noise-cancelling headphones with deep bass and 30-hour battery life.', 8500.00,'/uploads/headphone.jpg', 'Electronics', 120),
('Designer T-Shirt', 'Comfortable and stylish 100% cotton t-shirt, unisex fit.', 1200.00, '/uploads/tshirt.jpg', 'Clothing', 200),
('Fiction Novel: The Enigma', 'A thrilling mystery novel that will keep you on the edge of your seat.', 450.00, '/uploads/novel.jpg', 'Books', 300),
('Smartphone Elite', 'Latest smartphone with amazing camera, edge-to-edge display, and long battery.', 75000.00, '/uploads/smartphone.jpg', 'Electronics', 70),
('Bluetooth Speaker Mini', 'Compact and portable speaker with powerful sound and waterproof design.', 2500.00, '/uploads/mini.jpg', 'Electronics', 150),
('Gaming Mouse RGB', 'High-precision gaming mouse with customizable RGB lighting and 12 programmable buttons.', 1800.00, '/uploads/mouse.jpg', 'Electronics', 90),
('Running Shoes Pro', 'Lightweight and durable running shoes for optimal performance. Available in various sizes.', 5500.00, '/uploads/shoes.jpg', 'Clothing', 100),
('Cookbook: Italian Delights', 'A collection of authentic Italian recipes for home cooks.', 900.00, '/uploads/book.jpg', 'Books', 180),
('Smartwatch Fitness', 'Track your health and fitness with this feature-rich smartwatch. Heart rate, steps, sleep monitor.', 15000.00,'/uploads/watch.jpg', 'Electronics', 60);

-- -----------------------------------------------------------
-- 5. Notes
-- -----------------------------------------------------------

-- ⚠️ Replace 'StrongP@ssw0rd123!' with your actual production password.
-- ⚠️ Do NOT hardcode plaintext passwords into your app.
-- ⚠️ Use bcrypt to hash passwords during registration.

-- To manually insert an admin user, first generate a bcrypt hash of the password and insert it like:
-- INSERT INTO users (username, email, password_hash, role) VALUES
-- ('admin_user', 'admin@example.com', '$2a$10$YOUR_HASHED_PASSWORD', 'admin');
