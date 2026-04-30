import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";
import './App.css';

const getApiUrl = () => import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const Home = () => {
  const [formData, setFormData] = useState({ name: '', email: '', text: '' });
  const [dbProjects, setDbProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const API_BASE = getApiUrl();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      if (Array.isArray(data)) setDbProjects(data);
    } catch (err) { console.error(err); }
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
        toast.success("Message sent!");
        setFormData({ name: '', email: '', text: '' });
      }
    } catch (error) { toast.error("Error!"); }
  };

  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="container nav-row">
          <div className="brand">AGSHIN</div>
          <nav className="nav-links"><a href="#projects">Projects</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
        </div>
      </header>
      <main>
        <section className="hero-section">
          <motion.div className="container hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="hero-badge">Software Engineering Student</div>
            <h1 className="hero-title">Agshin Heybatli</h1>
            <p className="hero-text">Building scalable and modern web applications.</p>
            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">View Projects</a>
              <a href="#contact" className="btn btn-secondary">Contact Me</a>
            </div>
          </motion.div>
        </section>

        <section id="projects" className="section-block">
          <div className="container">
            <motion.div className="section-heading" {...fadeInUp}><h2>Featured Projects</h2></motion.div>
            <div className="projects-grid">
              {dbProjects.map((p, i) => (
                <motion.div key={p._id || i} className="project-card" {...fadeInUp} onClick={() => setSelectedProject(p)}>
                  <div className="card-content">
                    <span className="project-type">{p.type}</span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <div className="project-stack">{p.stack?.map((s, j) => <span key={j} className="mini-pill">{s}</span>)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <AnimatePresence>
          {selectedProject && (
            <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
              <motion.div className="modal-content" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={e => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setSelectedProject(null)}>×</button>
                <h2>{selectedProject.title}</h2>
                <p>{selectedProject.detailedDescription || selectedProject.description}</p>
                <div className="modal-footer">
                  {selectedProject.githubLink && <a href={selectedProject.githubLink} target="_blank" className="btn btn-secondary">GitHub</a>}
                  {selectedProject.liveLink && <a href={selectedProject.liveLink} target="_blank" className="btn btn-primary">Live Demo</a>}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const Admin = () => {
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  const [currentTag, setCurrentTag] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [newProject, setNewProject] = useState({ title: '', description: '', detailedDescription: '', stack: [], type: '', githubLink: '', liveLink: '' });
  
  const API_BASE = getApiUrl();

  useEffect(() => { checkSession(); }, []);

  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/check`, { credentials: 'include' });
      if (res.ok) { setIsAuthenticated(true); fetchData(); }
    } catch (err) { console.log("No session"); } finally { setLoading(false); }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentTag.trim() !== "") {
      e.preventDefault();
      if (!newProject.stack.includes(currentTag.trim())) {
        setNewProject({ ...newProject, stack: [...newProject.stack, currentTag.trim()] });
      }
      setCurrentTag("");
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setNewProject({ ...p, stack: p.stack || [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE}/projects/${editingId}` : `${API_BASE}/projects`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
      credentials: 'include'
    });
    if (res.ok) {
      toast.success(editingId ? "Updated!" : "Added!");
      setEditingId(null);
      setNewProject({ title: '', description: '', detailedDescription: '', stack: [], type: '', githubLink: '', liveLink: '' });
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
    const data = await res.json();
    if (data.success) { setIsAuthenticated(true); fetchData(); }
    else toast.error("Denied");
  };

  if (loading) return <div className="admin-loading">Loading...</div>;

  if (!isAuthenticated) return (
    <div className="admin-login-page">
      <form onSubmit={handleLogin} className="admin-login-form">
        <h2>Admin Access</h2>
        <input type="text" placeholder="User" value={loginData.username} onChange={e => setLoginData({...loginData, username: e.target.value})} required />
        <input type="password" placeholder="Pass" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required />
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="brand">A G S H I N</div>
        <button onClick={() => { fetch(`${API_BASE}/admin/logout`, {method:'POST', credentials:'include'}); setIsAuthenticated(false); }}>Logout</button>
      </header>
      <div className="container admin-container">
        <section className="admin-section">
          <h2>{editingId ? "Edit Project" : "Add Project"}</h2>
          <form onSubmit={handleAddProject} className="project-form">
            <input type="text" placeholder="Title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
            <textarea placeholder="Description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} required />
            <div className="tags-input-container">
              {newProject.stack.map((tag, i) => (
                <div key={i} className="tag-item">{tag}<button type="button" onClick={() => setNewProject({...newProject, stack: newProject.stack.filter((_, idx)=>idx!==i)})}>×</button></div>
              ))}
              <input type="text" placeholder="Stack + Enter" value={currentTag} onChange={e => setCurrentTag(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Save"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setNewProject({title:'', description:'', detailedDescription:'', stack:[], type:'', githubLink:'', liveLink:''}); }} className="btn-secondary">Cancel</button>}
          </form>
          <div className="admin-list">
            {projects.map(p => (
              <div key={p._id} className="admin-item">
                <span>{p.title}</span>
                <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={() => startEdit(p)} style={{background:'#27272a', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px'}}>Edit</button>
                  <button onClick={async () => { if(window.confirm("Delete?")) { await fetch(`${API_BASE}/projects/${p._id}`, {method:'DELETE', credentials:'include'}); fetchData(); } }} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-section">
          <h2>Messages</h2>
          {messages.map(m => (
            <div key={m._id} className="admin-message-card">
              <h3>{m.name}</h3><p>{m.text}</p>
              <button onClick={async () => { await fetch(`${API_BASE}/messages/${m._id}`, {method:'DELETE', credentials:'include'}); fetchData(); }} className="delete-btn">Delete</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default function App() { 
  return (
    <BrowserRouter>
      <Toaster position="bottom-left" />
      <Routes><Route path="/" element={<Home />} /><Route path="/admin" element={<Admin />} /></Routes>
      <Analytics />
    </BrowserRouter>
  ); 
}