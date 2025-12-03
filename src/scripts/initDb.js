const { query } = require('../config/db');
const bcrypt = require('bcrypt');

const createTables = async () => {
  try {
    // Posts Table
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) DEFAULT 'Anónimo',
        target_name VARCHAR(255),
        profession VARCHAR(255),
        location VARCHAR(255),
        description TEXT NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        likes INTEGER DEFAULT 0,
        image_url TEXT,
        status VARCHAR(50) DEFAULT 'approved'
      );
    `);
    console.log('Posts table created or already exists.');

    // Users Table (Admins)
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin'
      );
    `);
    console.log('Users table created or already exists.');

    // Create Default Admin if not exists
    const adminCheck = await query("SELECT * FROM users WHERE username = 'admin'");
    if (adminCheck.rows.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt); // Default password: admin123
        await query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', ['admin', hash]);
        console.log('Default admin user created: admin / admin123');
    } else {
        console.log('Admin user already exists.');
    }

  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

createTables();
