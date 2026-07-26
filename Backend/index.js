import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Connect to Database
connectDB();

// Middleware
import path from 'path';
import { fileURLToPath } from 'url';

app.use(cors());
app.use(express.json());

// Serve static uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
import hackathonRoutes from './routes/hackathonRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/registrations', registrationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
