const { Pool } = require('pg');
const dns = require('dns').promises;
require('dotenv').config();

let pool = null;

const createPool = async (port) => {
    let hostToUse = process.env.DB_HOST;
    try {
        // Usamos dns.lookup con family: 4, que es más robusto que resolve4 en algunos entornos
        const { address } = await dns.lookup(hostToUse, { family: 4 });
        if (address) {
             hostToUse = address;
        }
    } catch (err) {
        console.warn('Fallo al buscar IP v4, intentando conexión con host original:', err.message);
    }

    return new Pool({
        user: process.env.DB_USER,
        host: hostToUse,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: port,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000, // Fail fast to retry
    });
};

const getPool = async () => {
  if (pool) return pool;

  const originalPort = process.env.DB_PORT || 5432;
  
  // Try first with the configured port
  console.log(`Intentando conectar a DB en puerto: ${originalPort}...`);
  let tempPool = await createPool(originalPort);

  try {
      // Test connection
      const client = await tempPool.connect();
      client.release();
      console.log('Conexión exitosa a PostgreSQL');
      pool = tempPool;
      return pool;
  } catch (err) {
      console.error(`Fallo conexión en puerto ${originalPort}:`, err.message);
      
      // If configured port was 6543 (Supabase Pooler) and failed, try 5432 (Direct/Session)
      if (originalPort == 6543 || originalPort == '6543') {
          console.log('⚠️ Puerto 6543 falló. Intentando fallback automático al puerto 5432 (Estándar)...');
          try {
              // Close failed pool
              await tempPool.end(); 
              
              // Retry with 5432
              tempPool = await createPool(5432);
              const client = await tempPool.connect();
              client.release();
              console.log('✅ Conexión exitosa en puerto 5432 (Fallback)');
              pool = tempPool;
              return pool;
          } catch (retryErr) {
              console.error('❌ Falló también el intento de fallback al puerto 5432:', retryErr.message);
              throw retryErr; // Throw the final error
          }
      }
      
      throw err;
  }

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  return pool;
};

module.exports = {
  query: async (text, params) => {
    // Ensure pool is initialized
    if (!pool) {
        await getPool();
    }
    return pool.query(text, params);
  },
};