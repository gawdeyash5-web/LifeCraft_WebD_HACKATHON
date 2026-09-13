import dotenv from 'dotenv';
import app from './app.js';
import { checkDbConnection } from './database/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start Server for local development / long-running Node processes
const server = app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`⚔️  LIFECRAFT Backend API Active`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`=========================================`);

  // Non-blocking database check
  await checkDbConnection();
});

export default server;
