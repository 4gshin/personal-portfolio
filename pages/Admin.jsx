import React, { useState, useEffect } from 'react';
import { 
  FiHome, FiMail, FiLayers, FiLogOut, FiPlus, FiTrash2, FiActivity, FiMessageSquare 
} from 'react-icons/fi';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

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
        alert(data.message || "Entry denied!");
      }
    } catch (error) {
      alert("Server connection failed!");
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
  };

  const deleteMsg = async (id) => {
    if (window.confirm("Silinsin?")) {
      const res = await fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchAllData();
    }
  };

  if (loading) return <div className="loader-screen">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <form onSubmit={handleLogin} className="login-box">
          <h2>ADMIN ACCESS</h2>
          <input type="text" placeholder="Username" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e.target.value})} required />
          <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e.target.value})} required />
          <button type="submit">LOGIN</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">A H</div>
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
        <button onClick={handleLogout} className="logout-btn-sidebar"><FiLogOut /> <span>Logout</span></button>
      </aside>

      <main className="content">
        {activeTab === 'home' && (
          <div className="home-tab">
            <h1>Xoş gəldin, Agşin.</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <FiMessageSquare />
                <h3>{messages.length}</h3>
                <p>Messages</p>
              </div>
              <div className="stat-card">
                <FiLayers />
                <h3>{projects.length}</h3>
                <p>Projects</p>
              </div>
              <div className="stat-card">
                <FiActivity />
                <h3>Online</h3>
                <p>Status</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-tab">
            <h2>Gələn Mesajlar</h2>
            <div className="msg-list">
              {messages.map(m => (
                <div key={m._id} className="msg-card">
                  <div className="msg-header">
                    <div>
                      <h4>{m.name}</h4>
                      <p>{m.email}</p>
                    </div>
                    <button onClick={() => deleteMsg(m._id)}><FiTrash2 /></button>
                  </div>
                  <div className="msg-body">{m.text}</div>
                  <div className="msg-footer">{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-tab">
            <div className="tab-header">
              <h2>Layihələr</h2>
              <button className="add-proj-btn"><FiPlus /> Add Project</button>
            </div>
            <div className="proj-grid">
              {projects.map(p => (
                <div key={p._id} className="proj-admin-card">
                  <h4>{p.title}</h4>
                  <p>{p.category}</p>
                  <div className="proj-actions">
                    <button>Edit</button>
                    <button className="del">Delete</button>
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