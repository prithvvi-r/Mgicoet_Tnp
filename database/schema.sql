-- Database Schema for TNP System

CREATE DATABASE IF NOT EXISTS tnp_system;
USE tnp_system;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'tnp_officer', 'student') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_username (email, username)
);

-- 2. companies
CREATE TABLE IF NOT EXISTS companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    company_size VARCHAR(50),
    website VARCHAR(255),
    status ENUM('Active', 'Inactive', 'Blacklisted', 'Prospective') DEFAULT 'Prospective',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_city_industry (status, city, industry)
);

-- 3. company_hr_contacts
CREATE TABLE IF NOT EXISTS company_hr_contacts (
    hr_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    hr_name VARCHAR(255),
    hr_email VARCHAR(255),
    hr_phone VARCHAR(50),
    hr_designation VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id)
);

-- 4. company_requirements
CREATE TABLE IF NOT EXISTS company_requirements (
    requirement_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    branches_allowed TEXT, -- comma separated
    cgpa_cutoff DECIMAL(3,2),
    backlogs_allowed BOOLEAN,
    max_backlogs INT,
    required_skills TEXT,
    job_type ENUM('Full-time', 'Internship', 'Internship+PPO'),
    ctc_min DECIMAL(10,2),
    ctc_max DECIMAL(10,2),
    stipend DECIMAL(10,2),
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    INDEX idx_company_id_job_type (company_id, job_type)
);

-- 5. company_remarks
CREATE TABLE IF NOT EXISTS company_remarks (
    remark_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    user_id INT NOT NULL,
    remark_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_company_created (company_id, created_at DESC)
);

-- 6. company_status_history
CREATE TABLE IF NOT EXISTS company_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    user_id INT NOT NULL,
    old_status VARCHAR(50), -- Enum string
    new_status VARCHAR(50), -- Enum string
    reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_company_changed (company_id, changed_at DESC)
);

-- 7. company_communication_log
CREATE TABLE IF NOT EXISTS company_communication_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    user_id INT NOT NULL,
    communication_type ENUM('Email', 'Call', 'Meeting', 'Other'),
    notes TEXT,
    communication_date DATE,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_company_comm_date (company_id, communication_date)
);

-- 8. company_placement_history
CREATE TABLE IF NOT EXISTS company_placement_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    year INT NOT NULL,
    students_hired INT DEFAULT 0,
    avg_package DECIMAL(10,2),
    highest_package DECIMAL(10,2),
    lowest_package DECIMAL(10,2),
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    UNIQUE KEY uniq_company_year (company_id, year)
);

-- 9. students
CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    branch VARCHAR(100) NOT NULL,
    batch_year INT NOT NULL,
    cgpa DECIMAL(3,2),
    has_backlogs BOOLEAN DEFAULT FALSE,
    backlog_count INT DEFAULT 0,
    skills TEXT,
    placement_status ENUM('Unplaced', 'Placed') DEFAULT 'Unplaced',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_student_filter (branch, batch_year, placement_status)
);

-- 10. applications
CREATE TABLE IF NOT EXISTS applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    company_id INT NOT NULL,
    application_status ENUM('Applied', 'Shortlisted', 'Interviewed', 'Selected', 'Rejected') DEFAULT 'Applied',
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    interview_feedback TEXT,
    interview_score DECIMAL(5,2),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    UNIQUE KEY uniq_student_company (student_id, company_id),
    INDEX idx_app_status (application_status)
);
