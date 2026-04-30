import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const [{ default: app }, { default: connectDB }, { configureSocket }] = await Promise.all([
  import('./app.js'),
  import('./config/db.js'),
  import('./socket/index.js')
]);

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
