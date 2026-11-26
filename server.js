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
import AuditEvent from './models/AuditEvent.js';
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

async function recordAudit(action, outcome, { actor, targetId } = {}) {
  try {
    await AuditEvent.create({ action, outcome, actor, targetId });
  } catch {
    console.error('Audit event could not be saved:', action, outcome);
  }
}

// 3. RATE LIMITERS 
const limiterHelper = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  validate: false, 
  keyGenerator: (req) => {
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
  const { username, password } = sanitizedBody ?? {};

  if (typeof username === 'string' && typeof password === 'string' && username === process.env.ADMIN_USER) {
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (isMatch) {
      const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '12h' });
      
      await recordAudit('login', 'success', { actor: username });
      res.cookie('admin_token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'None', 
        maxAge: 12 * 60 * 60 * 1000 
      });
      return res.json({ success: true });
    }
  }
  await recordAudit('login', 'failure');
  res.status(401).json({ success: false, message: "Invalid credentials!" });
});

app.post('/api/admin/logout', async (req, res) => {
  let actor;
  try {
    actor = jwt.verify(req.cookies.admin_token, process.env.JWT_SECRET).user;
  } catch {
    // Missing or expired sessions can still clear the cookie.
  }
  if (actor) await recordAudit('logout', 'success', { actor });
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

app.get('/api/admin/audit-log', protect, async (req, res) => {
  const before = req.query.before;
  if (before !== undefined && !mongoose.isObjectIdOrHexString(before)) {
    return res.status(400).json({ error: 'Invalid audit log cursor' });
  }

  const pageSize = 25;
  try {
    const filter = before ? { _id: { $lt: before } } : {};
    const rows = await AuditEvent.find(filter).sort({ _id: -1 }).limit(pageSize + 1).lean();
    const events = rows.slice(0, pageSize);
    res.set('Cache-Control', 'no-store').json({
      events,
      nextCursor: rows.length > pageSize ? events.at(-1)._id : null
    });
  } catch {
    res.status(500).json({ error: 'Audit log could not be loaded' });
  }
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
    const deleted = await Message.findByIdAndDelete(req.params.id);
    await recordAudit('message.delete', deleted ? 'success' : 'failure', {
      actor: req.admin.user,
      targetId: deleted?._id
    });
    res.json({ success: true });
  } catch {
    await recordAudit('message.delete', 'failure', { actor: req.admin.user });
    res.status(500).json({ error: "Delete failed!" });
  }
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
    await recordAudit('project.create', 'success', { actor: req.admin.user, targetId: newProject._id });
    res.status(201).json({ success: true, message: "Project added!" });
  } catch {
    await recordAudit('project.create', 'failure', { actor: req.admin.user });
    res.status(400).json({ error: "Add failed!" });
  }
});

app.put('/api/projects/:id', protect, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    await recordAudit('project.update', updated ? 'success' : 'failure', {
      actor: req.admin.user,
      targetId: updated?._id ?? req.params.id
    });
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true, message: "Project updated!" });
  } catch {
    await recordAudit('project.update', 'failure', { actor: req.admin.user });
    res.status(500).json({ error: "Update failed!" });
  }
});

app.delete('/api/projects/:id', protect, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    await recordAudit('project.delete', deleted ? 'success' : 'failure', {
      actor: req.admin.user,
      targetId: deleted?._id
    });
    res.json({ success: true, message: "Deleted!" });
  } catch {
    await recordAudit('project.delete', 'failure', { actor: req.admin.user });
    res.status(500).json({ error: "Delete failed!" });
  }
});

app.get('/api/ping', (req, res) => res.status(200).send('pong'));

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