const { Pool } = require('pg');
const dns = require('dns').promises;
require('dotenv').config();

let pool = null;

const getPool = async () => {
  if (pool) return pool;

  let hostToUse = process.env.DB_HOST;
  
  try {
    console.log(`Resolviendo DNS para: ${hostToUse}...`);
    const addresses = await dns.resolve4(hostToUse);
    if (addresses && addresses.length > 0) {
      hostToUse = addresses[0];
      console.log(`DNS Resuelto: Usando IP ${hostToUse} para forzar IPv4`);
    }
  } catch (err) {
    console.warn('Fallo al resolver DNS manual, intentando conexión directa:', err.message);
  }

  pool = new Pool({
    user: process.env.DB_USER,
    host: hostToUse,
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

  return pool;
};

module.exports = {
  query: async (text, params) => {
    const p = await getPool();
    return p.query(text, params);
  },
};
