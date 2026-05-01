import React, { useState, useEffect } from 'react';
import { 
  FiHome, FiMail, FiLayers, FiLogOut, FiPlus, FiTrash2, FiActivity, FiMessageSquare, FiEdit 
} from 'react-icons/fi';
import './App.css'; // Sən App.css istifadə etdiyin üçün bura yönləndirdim

const Admin = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  // Yeni Layihə Formu üçün State
  const [newProject, setNewProject] = useState({ 
    title: '', category: '', shortDesc: '', longDesc: '', github: '', live: '', stack: '' 
  });

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/check`, { credentials: 'include' });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchAllData();
      }
    } catch (err) {
      console.log("Session check failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [msgRes, projRes] = await Promise.all([
        fetch(`${API_BASE}/messages`, { credentials: 'include' }),
        fetch(`${API_BASE}/projects`)
      ]);
      if (msgRes.ok) setMessages(await msgRes.json());
      if (projRes.ok) setProjects(await projRes.json());
    } catch (err) {
      console.error("Data fetch failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        credentials: 'include' 
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchAllData();
      } else {
        alert(data.message || "Giriş rədd edildi!");
      }
    } catch (error) {
      alert("Server xətası!");
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
  };

  const deleteMsg = async (id) => {
    if (window.confirm("Bu mesaj silinsin?")) {
      const res = await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchAllData();
    }
  };

  if (loading) return <div className="loader-screen">Yüklənir...</div>;

  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <form onSubmit={handleLogin} className="login-box">
          <div className="login-brand">A G S H I N</div>
          <h2>ADMIN ACCESS</h2>
          <input type="text" placeholder="İstifadəçi adı" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} required />
          <input type="password" placeholder="Şifrə" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
          <button type="submit" className="login-btn">DAXİL OL</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR - SOL PANEL */}
      <aside className="sidebar">
        <div className="sidebar-logo">AH</div>
        <nav className="sidebar-menu">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>
            <FiHome /> <span>Home</span>
          </button>
          <button className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
            <FiMail /> <span>Messages</span>
          </button>
          <button className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}>
            <FiLayers /> <span>Projects</span>
          </button>
        </nav>
        <button onClick={handleLogout} className="logout-btn-sidebar">
          <FiLogOut /> <span>Logout</span>
        </button>
      </aside>

      {/* MAIN CONTENT - SAĞ PANEL */}
      <main className="content">
        {activeTab === 'home' && (
          <div className="home-tab anim-fade">
            <h1 className="welcome-text">Xoş gəldin, Agşin.</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <FiMessageSquare className="stat-icon" />
                <h3>{messages.length}</h3>
                <p>Gələn Mesajlar</p>
              </div>
              <div className="stat-card">
                <FiLayers className="stat-icon" />
                <h3>{projects.length}</h3>
                <p>Layihələr Online</p>
              </div>
              <div className="stat-card">
                <FiActivity className="stat-icon" />
                <h3 style={{color: '#10b981'}}>Active</h3>
                <p>Server Status</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-tab anim-fade">
            <h2 className="section-title">Gələn Mesajlar</h2>
            <div className="msg-list">
              {messages.length > 0 ? messages.map(m => (
                <div key={m._id} className="msg-card">
                  <div className="msg-header">
                    <div className="sender-info">
                      <h4>{m.name}</h4>
                      <span>{m.email}</span>
                    </div>
                    <button className="del-btn-icon" onClick={() => deleteMsg(m._id)}><FiTrash2 /></button>
                  </div>
                  <div className="msg-body">{m.text}</div>
                  <div className="msg-footer">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              )) : <p className="empty-text">Hələlik mesaj yoxdur.</p>}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-tab anim-fade">
            <h2 className="section-title">Layihə İdarəetməsi</h2>
            
            {/* ADD PROJECT FORM (Screenshot 2026-05-01 at 15.50.10.jpg stilində) */}
            <div className="admin-section form-card">
              <h3><FiPlus /> Yeni Layihə Əlavə Et</h3>
              <form className="project-form">
                <input type="text" placeholder="Title" />
                <input type="text" placeholder="Type (məs: Web App)" />
                <input type="text" placeholder="Short Description" />
                <textarea placeholder="Detailed Description"></textarea>
                <div className="form-row">
                  <input type="text" placeholder="Stack (məs: React, Node)" />
                  <input type="text" placeholder="GitHub Link" />
                </div>
                <button type="submit" className="save-btn">Save Project</button>
              </form>
            </div>

            {/* PROJECT LIST */}
            <div className="proj-grid">
              {projects.map(p => (
                <div key={p._id} className="proj-admin-card">
                  <div className="proj-info">
                    <h4>{p.title}</h4>
                    <p>{p.category || 'Portfolio'}</p>
                  </div>
                  <div className="proj-actions">
                    <button className="edit-btn-sm"><FiEdit /> Edit</button>
                    <button className="del-btn-sm"><FiTrash2 /> Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;