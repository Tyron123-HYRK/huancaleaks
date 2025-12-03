const { Pool } = require('pg');
require('dotenv').config();

// --- DIAGNÓSTICO DE VARIABLES DE ENTORNO ---
console.log("--> Iniciando conexión a Base de Datos...");
console.log("DB_HOST Detectado:", process.env.DB_HOST ? `'${process.env.DB_HOST}'` : "UNDEFINED (Usando localhost por defecto)");
console.log("DB_USER Detectado:", process.env.DB_USER ? "SÍ" : "NO");
console.log("DB_PORT Detectado:", process.env.DB_PORT || "UNDEFINED");
// -------------------------------------------

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

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
