const { Pool } = require('pg');
const dns = require('dns');
require('dotenv').config();

// --- FORCE IPV4 for Supabase/Render ---
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
    console.log("DNS order set to ipv4first in db.js");
  }
} catch (e) {
  console.log("Could not set default result order for DNS", e);
}
// --------------------------------------

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
