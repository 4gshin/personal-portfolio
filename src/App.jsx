import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:5001/api";
};

const Home = () => {
  const [formData, setFormData] = useState({ name: '', email: '', text: '' });
  const API_BASE = getApiUrl(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        alert("Message sent successfully!");
        setFormData({ name: '', email: '', text: '' });
      } else {
        alert(data.error || "An error occurred");
      }
    } catch (error) {
      alert("Server connection failed!");
    }

    
  };

  const projects = [
    { title: "Todo App", description: "A simple yet functional task management app built with React, showcasing core frontend skills like state management, component structure, and interactive UI design.", stack: ["React", "JavaScript", "CSS"], type: "Frontend Project" },
    { title: "Library Book Tracking System", description: "Built a modular console-based library management system using ADT principles. Implemented book add/remove/search, borrow-return flow, sorting, and Big-O complexity analysis.", stack: ["C", "Algorithm Analysis", "Data Structures"], type: "University Project" },
    { title: "Tourism Website Idea", description: "A concept platform for helping tourists explore Azerbaijan. Focuses on user journey mapping and minimalist UI design", stack: ["UI/UX", "Frontend", "Planning"], type: "Concept Project" },
  ];

  const techStack = ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Git", "Vite"];
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div className="page-shell">
      <header className="site-header"><div className="container nav-row"><div className="brand">AGSHIN</div><nav className="nav-links"><a href="#projects">Projects</a><a href="#about">About</a><a href="#contact">Contact</a></nav></div></header>
      <main>
        <section className="hero-section"><motion.div className="container hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}><div className="hero-badge">Software Engineering Student</div><h1 className="hero-title">Agshin Heybatli</h1><p className="hero-text">Building scalable and modern web applications.</p><div className="hero-actions"><a href="#projects" className="btn btn-primary">View Projects</a><a href="#contact" className="btn btn-secondary">Contact Me</a></div></motion.div></section>
        <section id="projects" className="section-block"><div className="container"><motion.div className="section-heading" {...fadeInUp}><p className="section-kicker">Selected Work</p><h2>Featured Projects</h2></motion.div><div className="projects-grid">{projects.map((p, i) => (<motion.div key={i} className="project-card" {...fadeInUp} transition={{ delay: i * 0.1 }}><div className="card-content"><span className="project-type">{p.type}</span><h3>{p.title}</h3><p>{p.description}</p><div className="project-stack">{p.stack.map((s, j) => <span key={j} className="mini-pill">{s}</span>)}</div></div></motion.div>))}</div></div></section>
        <section id="about" className="section-block about-section"><div className="container about-container-lg"><motion.div className="about-text-side" {...fadeInUp}><p className="section-kicker">About Me</p><h2 className="about-title-lg">Driven by design, guided by code.</h2><div className="about-description-lg"><p>I’m a Software Engineering student who enjoys building things that feel both clean and meaningful.Building things that feel clean, meaningful, and easy to use.
Focused on structure, detail, and creating experiences that actually make sense.
</p><p>Building. Learning. Improving.</p></div><div className="stack-wrap-lg">{techStack.map((s, i) => <span key={i} className="stack-pill-lg">{s}</span>)}</div></motion.div></div></section>
        <section id="contact" className="section-block contact-section"><div className="container"><div className="contact-grid"><div className="contact-form-side"><p className="section-kicker">Contact</p><h2 className="contact-h2">Let’s connect.</h2><form className="contact-form" onSubmit={handleSubmit}><div className="input-row"><div className="input-group"><label>Full Name</label><input type="text" placeholder="Agshin Heybatli" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div><div className="input-group"><label>Email Address</label><input type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div></div><div className="input-group"><label>Message</label><textarea placeholder="How can I help you?" rows="6" value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} required></textarea></div><button type="submit" className="btn btn-primary send-btn">Send Message</button></form></div><div className="contact-info-side"><div className="info-block"><span className="info-label">Email</span><a href="mailto:contact@agshin.xyz" className="info-value">contact@agshin.xyz</a></div><div className="info-block"><span className="info-label">Location</span><p className="info-value">Ankara, Turkey</p></div></div></div></div></section>
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

const Admin = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const API_BASE = getApiUrl();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await(`${API_BASE}/admin/check`, { credentials: 'include' });
        if (res.ok) {
          setIsAuthenticated(true);
          fetchMessages();
        }
      } catch (err) { console.log("No session"); }
      finally { setLoading(false); }
    };
    checkSession();
  }, []);

  const fetchMessages = async () => {
    const res = await fetch(`${API_BASE}/messages`, { credentials: 'include' });
    if (res.status === 401) { setIsAuthenticated(false); return; }
    const data = await res.json();
    if (Array.isArray(data)) setMessages(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) { setIsAuthenticated(true); fetchMessages(); }
    else alert(data.message || "Entry denied!");
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    setMessages([]);
  };

  const deleteMsg = async (id) => {
    if(window.confirm("Are you sure you want to delete this message?")) {
      const res = await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchMessages();
    }
  };

  if (loading) return <div style={{background:'#09090b', color:'white', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div style={{ background: '#09090b', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'white' }}>
        <header style={{ padding: '30px 50px' }}><div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px' }}>A G S H I N</div></header>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <form onSubmit={handleLogin} style={{ background: '#18181b', padding: '40px', borderRadius: '16px', border: '1px solid #27272a', width: '350px' }}>
            <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Admin Access</h2>
            <input type="text" placeholder="Username" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} style={{ background: '#09090b', border: '1px solid #27272a', color: 'white', padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '20px', outline: 'none' }} required />
            <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} style={{ background: '#09090b', border: '1px solid #27272a', color: 'white', padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '30px', outline: 'none' }} required />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#09090b', minHeight: '100vh', color: '#fff', padding: '0 0 60px 0' }}>
      <header style={{ padding: '30px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #18181b' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '4px' }}>A G S H I N</div>
        <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
      </header>
      <div className="container" style={{ marginTop: '40px', padding: '0 50px' }}>
        <h2 style={{ marginBottom: '30px' }}>Dashboard</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {messages.length > 0 ? messages.map((m) => (
            <div key={m._id} style={{ background: '#18181b', border: '1px solid #27272a', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>{m.name}</h3>
                <p style={{ color: '#a1a1aa', fontSize: '14px' }}>{m.email}</p>
                <p style={{ color: '#e4e4e7', marginTop: '15px', whiteSpace: 'pre-wrap' }}>{m.text}</p>
                <p style={{ color: '#71717a', fontSize: '12px', marginTop: '10px' }}>{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => deleteMsg(m._id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
            </div>
          )) : <p>No messages yet..</p>}
        </div>
      </div>
    </div>
  );
};

export default function App() { return (<BrowserRouter><Routes><Route path="/" element={<Home />} /><Route path="/admin" element={<Admin />} /></Routes></BrowserRouter>); }