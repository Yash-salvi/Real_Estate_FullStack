-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS real_estate_db;
USE real_estate_db;

-- Drop tables in correct order if they exist to avoid FK constraints issues on rerun
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS enquiries;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(255) NOT NULL
);

-- 2. Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(38,2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    bhk INT NOT NULL,
    area_sqft INT NOT NULL,
    city VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    status VARCHAR(50) NOT NULL,
    agent_id BIGINT NOT NULL,
    is_booked BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    property_id BIGINT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 4. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 5. Create enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    buyer_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

-- 6. Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(255),
    order_id VARCHAR(255) NOT NULL,
    signature VARCHAR(255),
    amount DECIMAL(38,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    property_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed initial data
-- (Passwords are BCrypt hashed version of 'admin123', 'agent123', and 'buyer123')
INSERT INTO users (id, name, email, password, role, phone) VALUES
(1, 'System Admin', 'admin@example.com', '$2a$10$usSbG0836rUcMUaueDaxXOa587.yTz6.WoUTspaJvqpCBGCH/FGX2', 'ADMIN', '+91 98765 43210'),
(2, 'Sarah Jenkins', 'agent@example.com', '$2a$10$Wfukuchv/.rhyCqGMLWhTO.sCLDTD2wqyP72sVJO29yhSL9/2zjyS', 'AGENT', '+91 87654 32109'),
(3, 'John Doe', 'buyer@example.com', '$2a$10$NVO14hnXS.R3ZYOJZkiW8OMuSQxS5XRlIatyg1Do2b6mzzYjY8VnW', 'BUYER', '+91 76543 21098');

-- Note: Mumbai Penthouse (ID 1) isBooked = true. Pune Villa (ID 2) isFeatured = true. Bangalore Studio (ID 3) isBooked = true.
INSERT INTO properties (id, title, description, price, type, bhk, area_sqft, city, address, latitude, longitude, status, agent_id, is_booked, is_featured, created_at) VALUES
(1, 'Modern Luxury Sea-Facing Penthouse', 'Stunning sea-facing high-floor luxury penthouse with panoramic views of the Arabian Sea and Bandra-Worli Sea Link. Features custom Italian marble bathrooms, smart home automation, private elevator access, and a spacious deck. Equipped with high-end modular kitchen appliances.', 35000000.00, 'SALE', 3, 2400, 'Mumbai', 'Worli Sea Face, Worli', 19.0030, 72.8150, 'AVAILABLE', 2, TRUE, FALSE, NOW(6)),
(2, 'Elegant Suburban Family Villa', 'Nestled in the prime tree-lined lanes of Koregaon Park, this spacious independent villa offers an open-layout kitchen, private landscaped lawn, master bedrooms with walk-in wardrobes, a swimming pool, and dedicated parking for 3 cars. Excellent security and close to popular cafes.', 18000000.00, 'SALE', 4, 3200, 'Pune', 'Lane 5, Koregaon Park', 18.5362, 73.8930, 'AVAILABLE', 2, FALSE, TRUE, NOW(6)),
(3, 'Charming Cozy Tech-Hub Studio', 'Sun-lit, compact, and semi-furnished studio apartment located in Indiranagar. Ideal for tech professionals. Steps away from the metro station, organic markets, and top fitness centers. Very low monthly maintenance, 24/7 water supply, and backup generator.', 35000.00, 'RENT', 1, 550, 'Bangalore', '100 Feet Road, Indiranagar', 12.9718, 77.6411, 'AVAILABLE', 2, TRUE, FALSE, NOW(6)),
(4, 'Spacious Industrial Design Loft', 'A beautifully converted warehouse-style loft in Connaught Place, featuring high double-height ceilings, exposed brick accent walls, rustic concrete flooring, and large steel windows letting in ample natural light. Highly secure with immediate access to prime retail hubs.', 65000.00, 'RENT', 2, 1250, 'Delhi', 'Radial Road 3, Connaught Place', 28.6304, 77.2177, 'AVAILABLE', 2, FALSE, FALSE, NOW(6)),
(5, 'Sleek Minimalist Apartment', 'Stunning modern apartment situated in the vibrant heart of Bandra West. Features high-end minimalist design finishes, built-in custom wardrobes, a fully equipped modular kitchen with premium appliances, and a beautiful open balcony overlooking local tree-lined streets.', 95000.00, 'RENT', 2, 1100, 'Mumbai', 'Carter Road, Bandra West', 19.0654, 72.8227, 'AVAILABLE', 2, FALSE, FALSE, NOW(6)),
(6, 'Luxury Duplex Penthouse', 'A magnificent duplex penthouse in Whitefield featuring private terrace garden access, high ceilings, custom wooden staircases, marble floors, and massive windows. Located in a high-end gated residential society with club facilities, gym, and security.', 24000000.00, 'SALE', 4, 3600, 'Bangalore', 'ECC Road, Whitefield', 12.9698, 77.7499, 'AVAILABLE', 2, FALSE, FALSE, NOW(6)),
(7, 'Spacious Independent Builder Floor', 'A beautifully designed independent builder floor in GK-2. Offers premium marble flooring, split air conditioners in all rooms, a private elevator, an modular kitchen, dedicated stilt car parking, and a massive living-dining area perfect for large families.', 21000000.00, 'SALE', 3, 1800, 'Delhi', 'M-Block, Greater Kailash 2', 28.5323, 77.2403, 'AVAILABLE', 2, FALSE, FALSE, NOW(6)),
(8, 'Charming Low-Rise Condo', 'A bright and airy condo apartment located in Kalyani Nagar. Comes with custom woodwork, a modern kitchen, standard fixtures, and 24/7 security. Steps away from business parks, supermarkets, fine dining options, and public transport.', 45000.00, 'RENT', 2, 1300, 'Pune', 'East Avenue, Kalyani Nagar', 18.5482, 73.9030, 'AVAILABLE', 2, FALSE, FALSE, NOW(6)),
(9, 'Premium Modern Villa', 'An ultra-luxury 5 BHK villa located in Gachibowli. Offers smart automation, private home theatre room, massive swimming pool, custom modular kitchen, private lawn, solar power integration, and covered parking space for up to 4 cars. Highly secure gated complex.', 38000000.00, 'SALE', 5, 4500, 'Hyderabad', 'ISB Road, Gachibowli', 17.4194, 78.3489, 'AVAILABLE', 2, FALSE, FALSE, NOW(6)),
(10, 'Traditional Chettinad Bungalow', 'Exquisite bungalow in Adyar combining classic Chettinad architectural accents (such as Burma teak pillars and Athangudi tilework) with modern comforts. Features a massive courtyard, private well, updated modern modular kitchen, and beautiful garden surrounding.', 32000000.00, 'SALE', 4, 4000, 'Chennai', 'Gandhi Nagar, Adyar', 13.0067, 80.2577, 'AVAILABLE', 2, FALSE, FALSE, NOW(6));

INSERT INTO property_images (id, image_url, property_id) VALUES
-- P1 (Mumbai Penthouse)
(1, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80', 1),
(2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 1),
-- P2 (Pune Villa)
(3, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 2),
(4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 2),
-- P3 (Bangalore Studio)
(5, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 3),
(6, 'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80', 3),
-- P4 (Delhi Loft)
(7, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', 4),
(8, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80', 4),
-- P5 (Bandra Apartment)
(9, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 5),
(10, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', 5),
-- P6 (Whitefield Duplex)
(11, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80', 6),
(12, 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80', 6),
-- P7 (Delhi Builder Floor)
(13, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 7),
(14, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80', 7),
-- P8 (Pune Condo)
(15, 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80', 8),
(16, 'https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80', 8),
-- P9 (Hyderabad Villa)
(17, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', 9),
(18, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80', 9),
-- P10 (Chennai Bungalow)
(19, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', 10),
(20, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', 10);

-- Seed Payments Data
-- Mumbai Penthouse (ID 1): booked by Buyer John Doe (ID 3) for ₹50,000 (since 35,000,000 >= 20,000,000)
-- Pune Villa (ID 2): featured by Agent Sarah Jenkins (ID 2) for ₹1,000
-- Bangalore Studio (ID 3): booked by Buyer John Doe (ID 3) for ₹2,000 (since 35,000 < 50,000)
INSERT INTO payments (id, payment_id, order_id, signature, amount, payment_type, status, property_id, user_id, created_at) VALUES
(1, 'pay_mumbai_book123', 'order_mumbai_book123', 'sig_mumbai_book123', 50000.00, 'BOOKING', 'SUCCESS', 1, 3, NOW(6)),
(2, 'pay_pune_feat123', 'order_pune_feat123', 'sig_pune_feat123', 1000.00, 'PREMIUM', 'SUCCESS', 2, 2, NOW(6)),
(3, 'pay_blr_book123', 'order_blr_book123', 'sig_blr_book123', 2000.00, 'BOOKING', 'SUCCESS', 3, 3, NOW(6));
