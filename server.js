import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import Joi from 'joi'; 
import Message from './models/Message.js';
import Project from './models/Project.js';
import axios from 'axios'; 

dotenv.config();
const app = express();

// 1. PROXY VƏ GÜVƏNLİK BAŞLIQLARI
app.set('trust proxy', 1); 
app.use(helmet()); 
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); 

// 2. CORS AYARLARI
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:3000',
  'https://agshin.xyz', 
  'https://www.agshin.xyz'
]; 

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. RATE LIMITERS (IPv6 & Proxy Warning Fix)
const limiterHelper = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  // Express-rate-limit-in daxili IPv6 xəbərdarlıq sistemini sakitləşdiririk
  validate: { defaultValidations: false }, 
  keyGenerator: (req) => {
    // Render proxy-sindən gələn real istifadəçi IP-sini təhlükəsiz şəkildə dartırıq
    const xForwardedFor = req.headers['x-forwarded-for'];
    return xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.ip;
  },
  handler: (req, res) => res.status(429).json({ success: false, message })
});

const loginLimiter = limiterHelper(15 * 60 * 1000, 10, "Too many login attempts.");
const contactLimiter = limiterHelper(60 * 60 * 1000, 5, "Spam protection active.");

// 4. VALIDATION SCHEMAS (Joi)
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  text: Joi.string().min(10).max(1000).required().trim()
});

// 5. AUTH MIDDLEWARE
const protect = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ success: false, message: "Entry not allowed!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.clearCookie('admin_token', { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'None' 
    });
    res.status(401).json({ success: false, message: "Session expired!" });
  }
};

// --- ROUTES ---

// Admin Login 
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const sanitizedBody = mongoSanitize.sanitize(req.body);
  const { username, password } = sanitizedBody;

  if (username === process.env.ADMIN_USER) {
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (isMatch) {
      const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '12h' });
      
      res.cookie('admin_token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'None', 
        maxAge: 12 * 60 * 60 * 1000 
      });
      return res.json({ success: true });
    }
  }
  res.status(401).json({ success: false, message: "Invalid credentials!" });
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token', { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'None' 
  });
  res.json({ success: true });
});

app.get('/api/admin/check', protect, (req, res) => {
  res.json({ success: true, user: req.admin.user });
});

// Messages
app.get('/api/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) { res.status(500).json({ error: "Server error!" }); }
});

app.delete('/api/messages/:id', protect, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Delete failed!" }); }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const sanitizedBody = mongoSanitize.sanitize(req.body);
    const { error, value } = contactSchema.validate(sanitizedBody);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const newMessage = new Message(value);
    await newMessage.save();
    res.status(201).json({ success: true, message: "Sent!" });
  } catch (error) { res.status(500).json({ error: "Server error!" }); }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) { res.status(500).json({ error: "Fetch failed!" }); }
});

app.post('/api/projects', protect, async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json({ success: true, message: "Project added!" });
  } catch (error) { res.status(400).json({ error: "Add failed!" }); }
});

app.put('/api/projects/:id', protect, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true, message: "Project updated!" });
  } catch (error) { res.status(500).json({ error: "Update failed!" }); }
});

app.delete('/api/projects/:id', protect, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted!" });
  } catch (error) { res.status(500).json({ error: "Delete failed!" }); }
});

app.get('/api/ping', (req, res) => res.status(200).send('pong'));

// Keep-alive məntiqi (Render üçün 10 dəqiqəyə salındı ki, yuxuya getməsin)
const PING_INTERVAL = 10 * 60 * 1000;
function keepAlive() {
  setInterval(async () => {
    try { 
      await axios.get("https://portfolio-api-1ak2.onrender.com/api/ping", { timeout: 5000 }); 
      console.log("Self-ping successful.");
    } catch (e) { 
      console.error("Keep-alive ping failed:", e.message); 
    }
  }, PING_INTERVAL);
}
keepAlive();

// DB qoşulması
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error("DB connection error:", err));