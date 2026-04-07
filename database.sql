-- Данные администратора
-- 'anime@example.com',
-- '123123'
DROP DATABASE IF EXISTS clothing_store;
CREATE DATABASE clothing_store
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE clothing_store;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    phone VARCHAR(30) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'unisex') NOT NULL DEFAULT 'unisex',
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_sizes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    size VARCHAR(20) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    UNIQUE KEY unique_product_size (product_id, size),
    CONSTRAINT fk_product_sizes_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    product_size_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_cart_item (user_id, product_size_id),
    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_product_size
        FOREIGN KEY (product_size_id) REFERENCES product_sizes(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('new', 'paid', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'new',
    delivery_address VARCHAR(255) NOT NULL,
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_size_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    size_name VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_size
        FOREIGN KEY (product_size_id) REFERENCES product_sizes(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);

-- Администратор
-- Пароль: 123123
INSERT INTO users (name, email, password_hash, role, phone, city, address)
VALUES
(
    'Администратор',
    'anime@example.com',
    '$2a$10$uI5Si8vALrr/UgOFSGABMevpVijKtxRhXUVG5N22znB5XaUjaRFnW',
    'admin',
    '+7 (900) 000-00-00',
    'Москва',
    'ул. Примерная, 1'
);



INSERT INTO products (name, description, category, gender, price, image_url, is_active) VALUES
('Футболка Basic White', 'Белая базовая футболка из мягкого хлопка. Подходит для повседневной носки и легко сочетается с любым стилем.', 'Футболки', 'unisex', 1490.00, '/uploads/TShortwhite.jpg', TRUE),
('Футболка Basic Black', 'Чёрная универсальная футболка прямого кроя. Практичная модель на каждый день.', 'Футболки', 'unisex', 1490.00, '/uploads/TShortblack.jpg', TRUE),
('Футболка Oversize Sand', 'Песочная футболка oversize с плотной тканью и современным силуэтом.', 'Футболки', 'unisex', 1890.00, '/uploads/TShortYellow.jpg', TRUE),
('Лонгслив Minimal Gray', 'Серый лонгслив с длинным рукавом. Подходит для прохладной погоды и многослойных образов.', 'Лонгсливы', 'unisex', 2190.00, '/uploads/LongGray.jpg', TRUE),

('Худи Urban Black', 'Чёрное худи свободного кроя с капюшоном и карманом-кенгуру.', 'Худи', 'unisex', 3990.00, '/uploads/hoodieBlack.jpg', TRUE),
('Худи Milk Oversize', 'Молочное худи oversize с мягким начёсом внутри.', 'Худи', 'female', 4290.00, '/uploads/hoodiewhite.jpg', TRUE),
('Свитшот Classic Navy', 'Тёмно-синий свитшот классического кроя для базового гардероба.', 'Свитшоты', 'male', 3290.00, '/uploads/sweatshirtBlue.jpg', TRUE),

('Джинсы Classic Blue', 'Классические синие джинсы прямого кроя из плотного денима.', 'Джинсы', 'male', 4590.00, '/uploads/JeansClassicBlue.jpg', TRUE),
('Джинсы Mom Fit Light', 'Женские светлые джинсы mom fit с высокой посадкой.', 'Джинсы', 'female', 4790.00, '/uploads/JeansMomBlue.jpg', TRUE),
('Брюки Cargo Olive', 'Удобные cargo-брюки цвета олива с накладными карманами.', 'Брюки', 'male', 4390.00, '/uploads/CargoOlive.jpg', TRUE),
('Брюки Wide Leg Graphite', 'Широкие графитовые брюки с комфортной посадкой.', 'Брюки', 'female', 4490.00, '/uploads/WideLegGraphite.jpg', TRUE),

('Рубашка Linen Sky', 'Лёгкая льняная рубашка небесного оттенка для тёплого сезона.', 'Рубашки', 'male', 3590.00, '/uploads/LinenSky.jpg', TRUE),
('Рубашка Cotton Stripe', 'Хлопковая рубашка в полоску для офиса и повседневных образов.', 'Рубашки', 'female', 3690.00, '/uploads/CottonStripe.jpg', TRUE),

('Платье Summer Beige', 'Лёгкое бежевое платье для летнего гардероба.', 'Платья', 'female', 4990.00, '/uploads/SummerBeige.jpg', TRUE),
('Платье Black Midi', 'Чёрное платье миди с лаконичным дизайном.', 'Платья', 'female', 5490.00, '/uploads/BlackMidi.jpg', TRUE),

('Куртка Denim Blue', 'Джинсовая куртка среднего объёма, подходит для межсезонья.', 'Куртки', 'unisex', 5990.00, '/uploads/DenimBlue.jpg', TRUE),
('Куртка Bomber Black', 'Чёрный бомбер в городском стиле с плотной подкладкой.', 'Куртки', 'male', 6490.00, '/uploads/BomberBlack.jpg', TRUE),

('Юбка Pleated Gray', 'Плиссированная юбка серого цвета для повседневного и делового образа.', 'Юбки', 'female', 3390.00, '/uploads/PleatedGray.jpg', TRUE),
('Шорты Casual Beige', 'Бежевые шорты из хлопковой ткани для лета.', 'Шорты', 'unisex', 2590.00, '/uploads/CasualBeige.jpg', TRUE),
('Шорты Denim Blue', 'Синие джинсовые шорты универсального дизайна.', 'Шорты', 'female', 2790.00, '/uploads/ShortsDenimBlue.jpg', TRUE),

('Поло Premium White', 'Белое поло из плотного хлопка с аккуратным воротником.', 'Поло', 'male', 2890.00, '/uploads/PremiumWhite.jpg', TRUE),
('Поло Premium Black', 'Чёрное поло базового фасона для повседневной носки.', 'Поло', 'male', 2890.00, '/uploads/PremiumBlack.jpg', TRUE),

('Топ Ribbed Cream', 'Молочный женский топ в рубчик для базового гардероба.', 'Топы', 'female', 1790.00, '/uploads/RibbedCream.jpg', TRUE),
('Топ Ribbed Black', 'Чёрный топ в рубчик, хорошо сочетается с джинсами и юбками.', 'Топы', 'female', 1790.00, '/uploads/RibbedBlack.jpg', TRUE);

INSERT INTO product_sizes (product_id, size, stock) VALUES
(1, 'S', 12), (1, 'M', 18), (1, 'L', 15), (1, 'XL', 8),
(2, 'S', 10), (2, 'M', 16), (2, 'L', 14), (2, 'XL', 7),
(3, 'M', 9), (3, 'L', 11), (3, 'XL', 6),
(4, 'S', 8), (4, 'M', 12), (4, 'L', 10),

(5, 'M', 10), (5, 'L', 9), (5, 'XL', 5),
(6, 'S', 11), (6, 'M', 13), (6, 'L', 8),
(7, 'M', 7), (7, 'L', 9), (7, 'XL', 6),

(8, 'M', 8), (8, 'L', 12), (8, 'XL', 7),
(9, 'S', 9), (9, 'M', 10), (9, 'L', 8),
(10, 'M', 11), (10, 'L', 9), (10, 'XL', 5),
(11, 'S', 7), (11, 'M', 12), (11, 'L', 9),

(12, 'M', 8), (12, 'L', 7), (12, 'XL', 4),
(13, 'S', 9), (13, 'M', 10), (13, 'L', 6),

(14, 'S', 6), (14, 'M', 8), (14, 'L', 5),
(15, 'S', 5), (15, 'M', 7), (15, 'L', 4),

(16, 'M', 8), (16, 'L', 6), (16, 'XL', 4),
(17, 'M', 7), (17, 'L', 6), (17, 'XL', 3),

(18, 'S', 9), (18, 'M', 11), (18, 'L', 7),
(19, 'S', 12), (19, 'M', 14), (19, 'L', 10),
(20, 'S', 8), (20, 'M', 9), (20, 'L', 7),

(21, 'M', 10), (21, 'L', 8), (21, 'XL', 5),
(22, 'M', 9), (22, 'L', 7), (22, 'XL', 4),

(23, 'XS', 10), (23, 'S', 12), (23, 'M', 9),
(24, 'XS', 8), (24, 'S', 11), (24, 'M', 8);




