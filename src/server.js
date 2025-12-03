const dns = require('node:dns');
// Force IPv4 to avoid ENETUNREACH errors with Supabase/Render
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.log("Could not set default result order for DNS", e);
}

const app = require('./app');
const createTables = require('./scripts/initDb');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Initialize DB and then start server
createTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}/huancaleaks.html`);
  });
});
