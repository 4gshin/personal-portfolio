import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import Joi from 'joi'; 
import Message from './models/Message.js';
import Project from './models/Project.js'; // Yeni model importu
import axios from 'axios'; 

dotenv.config();
const app = express();
app.set('trust proxy', 1);

// Security and middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = ['http://localhost:5173', 'https://agshin.xyz']; 
app.use(cors({
  origin: allowedOrigins,
  credentials: true 
}));

const loginLimiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { success: false, message: "You have tried too many times, please wait 15 minutes." } 
});

const contactLimiter = rateLimit({ 
  windowMs: 60 * 60 * 1000, 
  max: 10, 
  message: { error: "Spam protection: Hourly limit exceeded." } 
});

// --- 2. AUTH MIDDLEWARE ---
const protect = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ success: false, message: "Entry is not allowed!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.clearCookie('admin_token');
    res.status(401).json({ success: false, message: "Session time has expired!" });
  }
};

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  text: Joi.string().min(10).max(2000).required().trim()
});

// --- API ROUTES ---

// Admin status check
app.get('/api/admin/check', protect, (req, res) => {
  res.json({ success: true, user: req.admin.user });
});

// Admin login
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER) {
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (isMatch) {
      const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: true, // Render/Vercel (Production) üçün vacibdir
        sameSite: 'None',
        maxAge: 86400000 // 24 saat
      });
      return res.json({ success: true });
    }
  }
  res.status(401).json({ success: false, message: "Invalid credentials!" });
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });
  res.json({ success: true });
});

// --- MESSAGE ROUTES ---
app.get('/api/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server error!" });
  }
});

app.delete('/api/messages/:id', protect, async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Message not found" });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Delete failed!" });
  }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { error, value } = contactSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newMessage = new Message(value);
    await newMessage.save();
    res.status(201).json({ message: "Sent!" });
  } catch (error) {
    res.status(500).json({ error: "Server error!" });
  }
});

// --- PROJECT ROUTES (Yeni Əlavələr) ---

// 1. Bütün proyektləri listələmək (Public)
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch projects!" });
  }
});

// 2. Yeni proyekt əlavə etmək (Protected)
app.post('/api/projects', protect, async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json({ success: true, message: "Project added!" });
  } catch (error) {
    res.status(400).json({ error: "Failed to add project!" });
  }
});

// 3. Proyekti silmək (Protected)
app.delete('/api/projects/:id', protect, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true, message: "Project deleted!" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed!" });
  }
});

// --- UTILS ---
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Keep-Alive (Cron Job simulyasiyası)
const PING_INTERVAL = 14 * 60 * 1000;
const URL = "https://portfolio-api-1ak2.onrender.com/api/ping".trim();

function keepAlive() {
  setInterval(async () => {
    try {
      const response = await axios.get(URL);
      console.log(`Self-ping successful. Status: ${response.status}`);
    } catch (error) {
      console.error(`Self-ping failed: ${error.message}`);
    }
  }, PING_INTERVAL);
}

keepAlive();

// Database Connection and Server Start
mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT || 5001, () => console.log("Server is running..."));
});