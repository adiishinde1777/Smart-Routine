-- =====================================================================
-- SMART ROUTINE - MySQL Database Schema (English Multi-Category)
-- Suitable for: Gym Enthusiasts, Patients & General Daily Routine Users
-- =====================================================================

CREATE DATABASE IF NOT EXISTS smart_routine_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_routine_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    profile_type VARCHAR(50) DEFAULT 'general',
    phone VARCHAR(30),
    avatar VARCHAR(255),
    device_id VARCHAR(64) DEFAULT 'ESP8266-SR-01',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Routines Table (Supports Medicine, Meals, Gym Supplements, Water & Habits)
CREATE TABLE IF NOT EXISTS routines (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    item_type ENUM('medicine', 'meal', 'workout', 'other') NOT NULL DEFAULT 'medicine',
    name VARCHAR(255) NOT NULL,
    time_slot VARCHAR(10) NOT NULL, -- e.g. '08:30', '13:00', '20:30'
    category VARCHAR(100) DEFAULT 'Daily Routine',
    dosage VARCHAR(150), -- e.g. '1 Tablet', '1 Scoop Whey (30g)', '2 Bowls'
    meal_type VARCHAR(100), -- 'Breakfast', 'Lunch', 'Evening Snack', 'Dinner', 'Pre-Workout', 'Post-Workout'
    food_relation VARCHAR(100), -- 'Before Meal', 'After Meal', 'With Food', 'Empty Stomach', 'None'
    compartment INT DEFAULT 1,
    notes TEXT,
    active_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Reminders / Daily Tracking Logs
CREATE TABLE IF NOT EXISTS reminders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    routine_id VARCHAR(64),
    scheduled_time VARCHAR(10) NOT NULL,
    scheduled_date DATE NOT NULL,
    status VARCHAR(100) DEFAULT 'Upcoming',
    actual_time VARCHAR(10),
    confirmed_by VARCHAR(50) DEFAULT 'web',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ESP8266 Device Sync & Audit Logs
CREATE TABLE IF NOT EXISTS device_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean existing seeds and re-insert in English
DELETE FROM reminders;
DELETE FROM routines;
DELETE FROM users;

-- Seed Default Profiles
INSERT INTO users (id, name, email, role, profile_type, phone, device_id)
VALUES 
('usr_mayur_1', 'Mayur (Daily Routine)', 'mayur@smartroutine.com', 'user', 'general', '+91 98765 43210', 'ESP8266-SR-01');

-- Seed Sample Routines
INSERT INTO routines (id, user_id, item_type, name, time_slot, category, dosage, meal_type, food_relation, compartment, notes)
VALUES
('rtn_mayur_1', 'usr_mayur_1', 'meal', 'Breakfast & Morning Routine', '08:00', 'Breakfast', 'Wholesome Breakfast', 'Breakfast', 'None', 1, 'Timely breakfast before morning medicines'),
('rtn_mayur_2', 'usr_mayur_1', 'medicine', 'Morning Medicine / Vitamin', '08:30', 'Vitamins & Supplements', '1 Tablet', 'Breakfast', 'After Meal', 1, 'Take with water after breakfast'),
('rtn_mayur_3', 'usr_mayur_1', 'meal', 'Lunch: 2 Chapatis & Vegetables', '13:00', 'Lunch', 'Full Midday Meal', 'Lunch', 'None', 2, 'Nutritious lunch'),
('rtn_mayur_4', 'usr_mayur_1', 'medicine', 'Multivitamin Capsule', '13:30', 'Vitamins & Minerals', '1 Capsule', 'Lunch', 'After Meal', 2, 'Take after lunch with water'),
('rtn_mayur_5', 'usr_mayur_1', 'medicine', 'Evening Care Pill', '20:00', 'Daily Health', '1 Tablet', 'Dinner', 'Before Meal', 3, 'Take 30 minutes before dinner'),
('rtn_mayur_6', 'usr_mayur_1', 'meal', 'Dinner & Light Food', '20:30', 'Dinner', 'Light Dinner', 'Dinner', 'None', 3, 'Light evening meal'),
('rtn_mayur_7', 'usr_mayur_1', 'medicine', 'Bedtime Health Supplement', '21:30', 'Night Care', '1 Tablet', 'Dinner', 'After Meal', 3, 'Take before bedtime with water');
