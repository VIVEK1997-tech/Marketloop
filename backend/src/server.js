import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { configureSocket } from './socket/index.js';

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

await connectDB();

const server = http.createServer(app);
configureSocket(server);

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${server.currentPort} is already in use. Stop the other process or set a free PORT in backend/.env.`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

const startServer = (port) => {
  server.currentPort = port;
  server.listen(port, () => {
    console.log(`API running on port ${port}`);
  });
};

startServer(PORT);
