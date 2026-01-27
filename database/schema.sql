-- -- Unolo Field Force Tracker - Database Schema

-- CREATE DATABASE IF NOT EXISTS unolo_tracker;
-- USE unolo_tracker;

-- -- Users table
-- CREATE TABLE IF NOT EXISTS users (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     role ENUM('employee', 'manager') DEFAULT 'employee',
--     manager_id INT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- Clients table
-- CREATE TABLE IF NOT EXISTS clients (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     name VARCHAR(100) NOT NULL,
--     address TEXT,
--     latitude DECIMAL(10, 8),
--     longitude DECIMAL(11, 8),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(name,address)
-- );

-- -- Employee-Client assignments
-- CREATE TABLE IF NOT EXISTS employee_clients (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     employee_id INT NOT NULL,
--     client_id INT NOT NULL,
--     assigned_date DATE NOT NULL,
--     FOREIGN KEY (employee_id) REFERENCES users(id),
--     FOREIGN KEY (client_id) REFERENCES clients(id),
--     UNIQUE(employee_id,client_id)
-- );

-- -- Attendance/Check-ins table
-- CREATE TABLE IF NOT EXISTS checkins (
--     id INT PRIMARY KEY AUTO_INCREMENT,
--     employee_id INT NOT NULL,
--     client_id INT NOT NULL,
--     checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     checkout_time TIMESTAMP NULL,
--     latitude VARCHAR(50),
--     longitude VARCHAR(50),
--     distance_from_client DECIMAL(10, 2) NULL,
--     notes TEXT,
--     status ENUM('checked_in', 'checked_out') DEFAULT 'checked_in',
--     UNIQUE(employee_id, client_id, checkin_time)
-- );

-- -- Create indexes for performance
-- CREATE INDEX IF NOT EXISTS idx_checkins_employee ON checkins(employee_id);
-- CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(checkin_time);
-- CREATE INDEX IF NOT EXISTS idx_employee_clients ON employee_clients(employee_id, client_id);


PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('employee', 'manager')) DEFAULT 'employee',
    manager_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, address)
);

-- Employee-Client assignments
CREATE TABLE IF NOT EXISTS employee_clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    assigned_date TEXT NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE(employee_id, client_id)
);

-- Attendance / Check-ins
CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    checkin_time TEXT DEFAULT CURRENT_TIMESTAMP,
    checkout_time TEXT,
    latitude TEXT,
    longitude TEXT,
    distance_from_client REAL,
    notes TEXT,
    status TEXT CHECK(status IN ('checked_in', 'checked_out')) DEFAULT 'checked_in',
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES clients(id),
    UNIQUE(employee_id, client_id, checkin_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkins_employee
ON checkins(employee_id);

CREATE INDEX IF NOT EXISTS idx_checkins_date
ON checkins(checkin_time);

CREATE INDEX IF NOT EXISTS idx_employee_clients
ON employee_clients(employee_id, client_id);
