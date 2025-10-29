-- ============================================
-- A'S SOLUTION RAFFLE SYSTEM - DATABASE SCHEMA
-- ============================================

CREATE DATABASE IF NOT EXISTS asolution_raffle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE asolution_raffle;

-- Raffle Settings Table
CREATE TABLE IF NOT EXISTS raffle_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    winner_count INT NOT NULL DEFAULT 1,
    status ENUM('not_started', 'active', 'ended') NOT NULL DEFAULT 'not_started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Raffle Entries Table
CREATE TABLE IF NOT EXISTS raffle_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    submitted_from ENUM('public', 'admin', 'bulk') NOT NULL DEFAULT 'public',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Raffle Winners Table
CREATE TABLE IF NOT EXISTS raffle_winners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entry_id INT NOT NULL,
    rank INT NOT NULL,
    drawn_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    FOREIGN KEY (entry_id) REFERENCES raffle_entries(id) ON DELETE CASCADE,
    INDEX idx_rank (rank),
    INDEX idx_published (published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create API user (run this with root privileges)
-- CREATE USER IF NOT EXISTS 'asolution_api'@'localhost' IDENTIFIED BY 'YOUR_SECURE_PASSWORD_HERE';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON asolution_raffle.* TO 'asolution_api'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- INITIAL DATA (OPTIONAL)
-- ============================================

-- Sample raffle settings
-- INSERT INTO raffle_settings (title, start_time, end_time, winner_count, status)
-- VALUES ('Sample Raffle', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 3, 'not_started');
