-- 1. Create Database First (Crucial to exist before granting specific rights usually)
CREATE DATABASE IF NOT EXISTS tnp_system;

-- 2. Create User
CREATE USER IF NOT EXISTS 'tnp_admin'@'localhost' IDENTIFIED BY 'tnp_pass_123';

-- 3. Grant Permissions
GRANT ALL PRIVILEGES ON tnp_system.* TO 'tnp_admin'@'localhost';

-- 4. Apply changes
FLUSH PRIVILEGES;
