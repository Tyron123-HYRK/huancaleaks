const { Pool } = require('pg');
const dns = require('dns').promises;
require('dotenv').config();

let pool = null;

const getPool = async () => {
  if (pool) return pool;

  let hostToUse = process.env.DB_HOST;
  
  try {
    console.log(`Buscando IP v4 para: ${hostToUse}...`);
    // Usamos dns.lookup con family: 4, que es más robusto que resolve4 en algunos entornos
    const { address } = await dns.lookup(hostToUse, { family: 4 });
    
    if (address) {
      console.log(`DNS Resuelto: Host ${hostToUse} -> IP ${address}`);
      hostToUse = address;
    }
  } catch (err) {
    console.warn('Fallo al buscar IP v4, intentando conexión con host original:', err.message);
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