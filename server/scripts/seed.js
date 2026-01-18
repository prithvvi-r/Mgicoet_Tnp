const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' }); // Adjust path to reach server root .env

const seedData = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '@Pvp260903',

            database: process.env.DB_NAME
        });

        console.log('Connected! Seeding data...');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('demo123', salt);

        // 1. Clear existing data (optional, careful in prod)
        // await connection.query('DELETE FROM users');
        // await connection.query('DELETE FROM companies');
        // await connection.query('DELETE FROM students');

        // 2. Users
        const users = [
            { username: 'admin', email: 'admin@tnp.com', role: 'admin' },
            { username: 'officer', email: 'officer@tnp.com', role: 'tnp_officer' },
            { username: 'student', email: 'student@tnp.com', role: 'student' }
        ];

        for (const u of users) {
            // Check if exists
            const [exists] = await connection.query('SELECT * FROM users WHERE email = ?', [u.email]);
            if (exists.length === 0) {
                await connection.query(
                    'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                    [u.username, u.email, passwordHash, u.role]
                );
                console.log(`User created: ${u.email}`);
            } else {
                console.log(`User exists: ${u.email}`);
            }
        }

        // Get Student User ID
        const [studentUser] = await connection.query('SELECT user_id FROM users WHERE email = ?', ['student@tnp.com']);
        const studentUserId = studentUser[0].user_id;

        // 3. Students
        const [existingStudent] = await connection.query('SELECT * FROM students WHERE email = ?', ['student@tnp.com']);
        if (existingStudent.length === 0) {
            await connection.query(
                `INSERT INTO students (user_id, roll_number, name, email, branch, batch_year, cgpa, skills, placement_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [studentUserId, 'CS101', 'Demo Student', 'student@tnp.com', 'CSE', 2024, 8.5, 'React, Node.js', 'Unplaced']
            );
            console.log('Student profile created');
        }

        // 4. Companies
        const companies = [
            { name: 'TechCorp', industry: 'IT', city: 'Bangalore', status: 'Active' },
            { name: 'InnoSystems', industry: 'Consulting', city: 'Pune', status: 'Prospective' },
            { name: 'BizSolutions', industry: 'Finance', city: 'Mumbai', status: 'Active' }
        ];

        for (const c of companies) {
            const [exists] = await connection.query('SELECT * FROM companies WHERE company_name = ?', [c.name]);
            if (exists.length === 0) {
                await connection.query(
                    'INSERT INTO companies (company_name, industry, city, status) VALUES (?, ?, ?, ?)',
                    [c.name, c.industry, c.city, c.status]
                );
                console.log(`Company created: ${c.name}`);
            }
        }

        console.log('\n--- SEEDING COMPLETE ---');
        console.log('Login Credentials (Password for all: demo123):');
        users.forEach(u => console.log(`Role: ${u.role} -> Email: ${u.email}`));

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        if (connection) await connection.end();
    }
};

seedData();
