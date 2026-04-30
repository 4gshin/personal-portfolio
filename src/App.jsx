import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";
import './App.css';

const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:5001/api";
};

// --- HOME KOMPONENTİ ---
const Home = () => {
  const [formData, setFormData] = useState({ name: '', email: '', text: '' });
  const [dbProjects, setDbProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const API_BASE = getApiUrl();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      if (Array.isArray(data)) setDbProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      if (response.ok) {
        toast.success("Message sent successfully!", {
          style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
        });
        setFormData({ name: '', email: '', text: '' });
      }
    } catch (error) {
      toast.error("Server connection error!");
    }
  };

  const techStack = ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Git", "Vite"];
  const fadeInUp = { 
    initial: { opacity: 0, y: 30 }, 
    whileInView: { opacity: 1, y: 0 }, 
    viewport: { once: true }, 
    transition: { duration: 0.6 } 
  };

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="container nav-row">
          <div className="brand">AGSHIN</div>
          <nav className="nav-links">
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>
      
      <main>
        <section className="hero-section">
          <motion.div className="container hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="hero-badge">Software Engineering Student</div>
            <h1 className="hero-title">Agshin Heybatli</h1>
            <p className="hero-text">Building scalable and modern web applications.</p>
            <div className="hero-actions">
              <motion.a href="#projects" className="btn btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>View Projects</motion.a>
              <motion.a href="#contact" className="btn btn-secondary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Contact Me</motion.a>
            </div>
          </motion.div>
        </section>

        <section id="projects" className="section-block">
          <div className="container">
            <motion.div className="section-heading" {...fadeInUp}>
              <p className="section-kicker">Selected Work</p>
              <h2>Featured Projects</h2>
            </motion.div>
            <div className="projects-grid">
              {dbProjects.map((p, i) => (
                <motion.div 
                  key={p._id || i} 
                  className="project-card" 
                  {...fadeInUp} 
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedProject(p)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-content">
                    <span className="project-type">{p.type}</span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <div className="project-stack">
                      {p.stack?.map((s, j) => (
                        <span key={j} className="mini-pill">{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Modal for Project Details */}
        <AnimatePresence>
          {selectedProject && (
            <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
              <motion.div 
                className="modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-modal" onClick={() => setSelectedProject(null)}>×</button>
                <span className="project-type">{selectedProject.type}</span>
                <h2>{selectedProject.title}</h2>
                <div className="modal-body">
                  <p>{selectedProject.detailedDescription || selectedProject.description}</p>
                  <div className="project-stack" style={{ marginTop: '20px' }}>
                    {selectedProject.stack?.map((s, j) => (
                      <span key={j} className="mini-pill">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedProject.githubLink && (
                    <a href={selectedProject.githubLink} target="_blank" rel="noreferrer" className="btn btn-secondary">GitHub</a>
                  )}
                  {selectedProject.liveLink && (
                    <a href={selectedProject.liveLink} target="_blank" rel="noreferrer" className="btn btn-primary">Live Demo</a>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* About Section ... eyni qaldı */}
        <section id="about" className="section-block about-section">
          <div className="container about-container-lg">
            <motion.div className="about-text-side" {...fadeInUp}>
              <p className="section-kicker">About Me</p>
              <h2 className="about-title-lg">Driven by design, guided by code.</h2>
              <div className="about-description-lg">
                <p>I’m a Software Engineering student who enjoys building things that feel both clean and meaningful.</p>
                <p>Building. Learning. Improving.</p>
              </div>
              <div className="stack-wrap-lg">
                {techStack.map((s, i) => (
                  <motion.span 
                    key={i} 
                    className="stack-pill-lg"
                    whileHover={{ scale: 1.1, backgroundColor: "#fff", color: "#000" }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="contact" className="section-block contact-section">
          <div className="container">
            <div className="contact-grid">
              <div className="contact-form-side">
                <p className="section-kicker">Contact</p>
                <h2 className="contact-h2">Let’s connect.</h2>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Full Name</label>
                      <input type="text" placeholder="Agshin Heybatli" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="input-group">
                      <label>Email Address</label>
                      <input type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Message</label>
                    <textarea placeholder="How can I help you?" rows="6" value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} required></textarea>
                  </div>
                  <motion.button type="submit" className="btn btn-primary send-btn" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Send Message
                  </motion.button>
                </form>
              </div>
              {/* Contact Info ... eyni qaldı */}
              <div className="contact-info-side">
                <div className="info-block">
                  <span className="info-label">Email</span>
                  <a href="mailto:contact@agshin.xyz" className="info-value">contact@agshin.xyz</a>
                </div>
                <div className="info-block">
                  <span className="info-label">Location</span>
                  <p className="info-value">Ankara, Turkey</p>
                </div>
                <div className="info-block">
                  <span className="info-label">Socials</span>
                  <div className="social-links" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <motion.a href="https://github.com/4gshin" target="_blank" rel="noopener noreferrer" whileHover={{ y: -3 }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    </motion.a>
                    <motion.a href="https://linkedin.com/in/4gshin" target="_blank" rel="noopener noreferrer" whileHover={{ y: -3 }}>
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-content">
          <div className="footer-line"></div>
          <div className="footer-bottom">
            <p className="copyright">© 2026 — Agshin Heybatli</p>
            <div className="footer-status">
              <span className="status-dot"></span>
              Available for new projects
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- ADMIN KOMPONENTİ ---
const Admin = () => {
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [newProject, setNewProject] = useState({
    title: '', description: '', detailedDescription: '', stack: '', type: '', githubLink: '', liveLink: ''
  });
  
  const API_BASE = getApiUrl();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/check`, { credentials: 'include' });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchData();
      }
    } catch (err) { console.log("No session"); }
    finally { setLoading(false); }
  };

  const fetchData = async () => {
    const [msgRes, projRes] = await Promise.all([
      fetch(`${API_BASE}/messages`, { credentials: 'include' }),
      fetch(`${API_BASE}/projects`)
    ]);
    const msgData = await msgRes.json();
    const projData = await projRes.json();
    if (Array.isArray(msgData)) setMessages(msgData);
    if (Array.isArray(projData)) setProjects(projData);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    const projectData = {
      ...newProject,
      stack: newProject.stack.split(',').map(s => s.trim())
    };
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
      credentials: 'include'
    });
    if (res.ok) {
      toast.success("Project added!");
      setNewProject({ title: '', description: '', detailedDescription: '', stack: '', type: '', githubLink: '', liveLink: '' });
      fetchData();
    }
  };

  const deleteProject = async (id) => {
    if(window.confirm("Delete project?")) {
      await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchData();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
      credentials: 'include'
    });
    if ((await res.json()).success) { 
      setIsAuthenticated(true); 
      fetchData(); 
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <form onSubmit={handleLogin} className="admin-login-form">
          <h2>Admin Access</h2>
          <input type="text" placeholder="Username" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} />
          <input type="password" placeholder="Password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} />
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="container admin-container">
        {/* Project Management Section */}
        <section className="admin-section">
          <h2>Manage Projects</h2>
          <form onSubmit={handleAddProject} className="project-form">
            <input type="text" placeholder="Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
            <input type="text" placeholder="Type (e.g. Portfolio)" value={newProject.type} onChange={e => setNewProject({...newProject, type: e.target.value})} />
            <textarea placeholder="Short Description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} required />
            <textarea placeholder="Detailed Description" value={newProject.detailedDescription} onChange={e => setNewProject({...newProject, detailedDescription: e.target.value})} />
            <input type="text" placeholder="Stack (comma separated)" value={newProject.stack} onChange={e => setNewProject({...newProject, stack: e.target.value})} />
            <div className="input-row">
              <input type="text" placeholder="GitHub Link" value={newProject.githubLink} onChange={e => setNewProject({...newProject, githubLink: e.target.value})} />
              <input type="text" placeholder="Live Link" value={newProject.liveLink} onChange={e => setNewProject({...newProject, liveLink: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary">Add Project</button>
          </form>

          <div className="admin-list">
            {projects.map(p => (
              <div key={p._id} className="admin-item">
                <span>{p.title}</span>
                <button onClick={() => deleteProject(p._id)} className="delete-btn">Delete</button>
              </div>
            ))}
          </div>
        </section>

        {/* Message Management Section */}
        <section className="admin-section">
          <h2>Messages</h2>
          <div className="admin-list">
            {messages.map(m => (
              <div key={m._id} className="admin-message-card">
                <h3>{m.name} <span>({m.email})</span></h3>
                <p>{m.text}</p>
                <button onClick={() => {
                   if(window.confirm("Delete msg?")) {
                     fetch(`${API_BASE}/messages/${m._id}`, { method: 'DELETE', credentials: 'include' }).then(() => fetchData());
                   }
                }} className="delete-btn">Delete</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default function App() { 
  return (
    <BrowserRouter>
      <Toaster position="bottom-left" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  ); 
}