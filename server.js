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
import axios from 'axios'; 


dotenv.config();
const app = express();
app.set('trust proxy', 1);

// sec and middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = ['http://localhost:5173', 'https://agshin.xyz']; 
app.use(cors({
  origin: allowedOrigins,
  credentials: true 
}));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { success: false, message: "You have tried too many times, please wait 15 minutes." } });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { error: "Spam protection: Hourly limit exceeded." } });

// --- 2. AUTH MIDDLEWARE ---
const protect = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ success: false, message: "Entry is not allowed !" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.clearCookie('admin_token');
    res.status(401).json({ success: false, message: "Session time has expired!" });
  }
};

// validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  text: Joi.string().min(10).max(2000).required().trim()
});

// api routes


app.get('/api/admin/check', protect, (req, res) => {
  res.json({ success: true, user: req.admin.user });
});

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER) {
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (isMatch) {
      const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 3600000 
      });
      return res.json({ success: true });
    }
  }
  res.status(401).json({ success: false, message: "Invalid credentials!" });
});


app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ success: true });
});

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
    res.status(201).json({ message: "Sent !" });
  } catch (error) {
    res.status(500).json({ error: "Server error!" });
  }
});



// Serverin oyaq qalıb-qalmadığını yoxlamaq üçün sadə endpoint
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// 2. Sonra Cron Job funksiyasını yazırıq
const PING_INTERVAL = 14 * 60 * 1000; 
const URL = `${process.env.SERVER_URL}/api/ping`;

function keepAlive() {
  setInterval(async () => {
    try {
      // Artıq import etdiyimiz axios-u burada rahat istifadə edirik
      const response = await axios.get(URL);
      console.log(`Self-ping sent to ${URL}. Status: ${response.status}`);
    } catch (error) {
      console.error(`Self-ping failed: ${error.message}`);
    }
  }, PING_INTERVAL);
}


// Funksiyanı işə sal
keepAlive();

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT || 5001, () => console.log("Server is running..."));
});

