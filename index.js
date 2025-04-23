import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors
import { networkInterfaces } from 'os'; // Import os for getting IP
import { registerValidation } from './validations/auth.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';

dotenv.config();

// Function to get local IP address
const getLocalIP = () => {
  const interfaces = networkInterfaces();
  for (const interfaceName of Object.keys(interfaces)) {
    for (const iface of interfaces[interfaceName]) {
      // Skip internal (e.g., 127.0.0.1) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // Fallback if no IP is found
};

mongoose
  .connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('test');
});

app.post('/auth/register', registerValidation, UserController.register);

app.post('/auth/login', UserController.login);

app.get('/auth/me', checkAuth, UserController.getMe);

const PORT = 3500;
const localIP = getLocalIP();

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    return console.log('Server error:', err);
  }
  console.log(`Server started on http://${localIP}:${PORT}`);
});