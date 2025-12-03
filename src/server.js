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
