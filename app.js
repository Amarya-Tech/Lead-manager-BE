import pool, { setupDatabase } from './config/db.js';
await setupDatabase();
import express, { json } from 'express';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { setupRoutes } from './routes.js';
config();


const app = express();
app.use(helmet());
app.use(json());
app.use(cookieParser());

// CORS setup
const corsOptions = {
  origin: ['http://localhost:6001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-encryption-key', 'x-access-token', '*'],
  credentials: true,
  path: '/',
  exposedHeaders: ['x-encryption-key'],
};
app.use(cors(corsOptions));

// Disable the X-Powered-By header
app.disable('x-powered-by');

setupRoutes(app) 
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

