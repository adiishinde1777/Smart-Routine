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
('usr_gym_1', 'Rohan (Fitness & Gym)', 'rohan.gym@smartroutine.com', 'user', 'fitness', '+91 98765 11111', 'ESP8266-SR-01'),
('usr_patient_1', 'Rahul Sharma (Patient)', 'rahul.sharma@smartroutine.com', 'user', 'patient', '+91 98765 22222', 'ESP8266-SR-01'),
('usr_general_1', 'Aditya (Daily Routine)', 'aditya@smartroutine.com', 'user', 'general', '+91 98765 33333', 'ESP8266-SR-01');

-- Seed Sample Routines
INSERT INTO routines (id, user_id, item_type, name, time_slot, category, dosage, meal_type, food_relation, compartment, notes)
VALUES
('rtn_gym_1', 'usr_gym_1', 'meal', 'Breakfast: Oatmeal & 3 Boiled Eggs', '08:00', 'Breakfast', '50g Oats + 3 Eggs', 'Breakfast', 'None', 1, 'High protein morning power breakfast'),
('rtn_gym_2', 'usr_gym_1', 'medicine', 'Daily Multivitamin & Fish Oil Softgel', '08:30', 'Vitamins & Supplements', '1 Capsule + 1 Softgel', 'Breakfast', 'After Meal', 1, 'Take with water after breakfast'),
('rtn_gym_3', 'usr_gym_1', 'meal', 'Lunch: Grilled Chicken / Paneer, Rice & Salad', '13:00', 'Lunch', 'Full Meal (2 Chapatis + 150g Protein)', 'Lunch', 'None', 2, 'Balanced nutritious midday meal'),
('rtn_gym_4', 'usr_gym_1', 'workout', 'Pre-Workout Snack: Banana & Black Coffee', '17:00', 'Gym & Fitness', '1 Banana + 1 Cup Black Coffee', 'Pre-Workout', 'Before Meal', 2, '30 minutes before workout session'),
('rtn_gym_5', 'usr_gym_1', 'workout', 'Post-Workout: Whey Protein Shake + 5g Creatine', '19:00', 'Gym & Fitness', '1 Scoop Whey (24g Protein) + 5g Creatine', 'Post-Workout', 'After Meal', 3, 'Mix with 250ml water immediately post-workout'),
('rtn_gym_6', 'usr_gym_1', 'meal', 'Dinner: Whole Wheat Roti, Dal & Steamed Veggies', '20:30', 'Dinner', '2 Roti + Lentil Soup + Salad', 'Dinner', 'None', 4, 'Light and healthy evening meal'),

('rtn_med_1', 'usr_patient_1', 'meal', 'Breakfast: Oatmeal Porridge & Warm Milk', '08:00', 'Breakfast', '1 Bowl Porridge + 1 Cup Milk', 'Breakfast', 'None', 1, 'Timely breakfast before morning medicines'),
('rtn_med_2', 'usr_patient_1', 'medicine', 'Metformin HCl 500mg (Diabetes Tablet)', '08:30', 'Diabetes Care', '1 Tablet (500mg)', 'Breakfast', 'After Meal', 1, 'Take strictly after breakfast with water'),
('rtn_med_3', 'usr_patient_1', 'meal', 'Lunch: 2 Chapatis, Green Veggies & Dal-Rice', '13:00', 'Lunch', '2 Chapatis + Veggies + Dal', 'Lunch', 'None', 2, 'Midday wholesome meal'),
('rtn_med_4', 'usr_patient_1', 'medicine', 'Multivitamin & Calcium Capsule', '13:30', 'Vitamins & Minerals', '1 Capsule', 'Lunch', 'After Meal', 3, 'Take after lunch with water'),
('rtn_med_5', 'usr_patient_1', 'medicine', 'BP Tablet (Telmisartan 40mg)', '20:00', 'Blood Pressure Care', '1 Tablet (40mg)', 'Dinner', 'Before Meal', 2, 'Take 30 minutes before evening dinner'),
('rtn_med_6', 'usr_patient_1', 'meal', 'Dinner: Light Moong Dal Khichdi & Curd', '20:30', 'Dinner', '1 Bowl Khichdi + Fresh Curd', 'Dinner', 'None', 4, 'Light evening dinner'),
('rtn_med_7', 'usr_patient_1', 'medicine', 'Atorvastatin 10mg (Bedtime Cholesterol Pill)', '21:30', 'Cardiovascular Care', '1 Tablet (10mg)', 'Dinner', 'After Meal', 4, 'Take before bedtime after dinner');
