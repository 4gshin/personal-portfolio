import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import '../App.css';

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const emptyProject = {
  title: '',
  description: '',
  detailedDescription: '',
  stack: [],
  type: '',
  githubLink: '',
  liveLink: ''
};

const Admin = () => {
  const API_BASE = getApiUrl();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const [projectForm, setProjectForm] = useState(emptyProject);
  const [currentTag, setCurrentTag] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/check`, { credentials: 'include' });

      if (res.ok) {
        setIsAuthenticated(true);
        await fetchData();
      }
    } catch (err) {
      console.log('No active admin session');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [msgRes, projRes] = await Promise.all([
        fetch(`${API_BASE}/messages`, { credentials: 'include' }),
        fetch(`${API_BASE}/projects`, { credentials: 'include' })
      ]);

      const msgData = await msgRes.json();
      const projData = await projRes.json();

      if (Array.isArray(msgData)) setMessages(msgData);
      if (Array.isArray(projData)) setProjects(projData);
    } catch (err) {
      toast.error('Data could not be loaded');
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });

      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        toast.success('Welcome back');
        await fetchData();
      } else {
        toast.error(data.message || 'Login denied');
      }
    } catch (err) {
      toast.error('Server connection error');
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    setIsAuthenticated(false);
    setLoginData({ username: '', password: '' });
  };

  const handleProjectChange = (field, value) => {
    setProjectForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();

    const cleanTag = currentTag.trim();
    if (!cleanTag) return;

    if (!projectForm.stack.includes(cleanTag)) {
      setProjectForm((prev) => ({
        ...prev,
        stack: [...prev.stack, cleanTag]
      }));
    }

    setCurrentTag('');
  };

  const removeTag = (tagIndex) => {
    setProjectForm((prev) => ({
      ...prev,
      stack: prev.stack.filter((_, index) => index !== tagIndex)
    }));
  };

  const resetProjectForm = () => {
    setProjectForm(emptyProject);
    setCurrentTag('');
    setEditingId(null);
  };

  const startEditProject = (project) => {
    setEditingId(project._id);
    setProjectForm({
      title: project.title || '',
      description: project.description || '',
      detailedDescription: project.detailedDescription || '',
      stack: Array.isArray(project.stack) ? project.stack : [],
      type: project.type || '',
      githubLink: project.githubLink || '',
      liveLink: project.liveLink || ''
    });

    setActiveTab('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveProject = async (e) => {
    e.preventDefault();

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `${API_BASE}/projects/${editingId}`
      : `${API_BASE}/projects`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Project save failed');

      toast.success(editingId ? 'Project updated' : 'Project added');
      resetProjectForm();
      await fetchData();
    } catch (err) {
      toast.error('Project could not be saved');
      console.error(err);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;

    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Project delete failed');

      toast.success('Project deleted');
      await fetchData();
    } catch (err) {
      toast.error('Project could not be deleted');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const res = await fetch(`${API_BASE}/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Message delete failed');

      toast.success('Message deleted');
      await fetchData();
    } catch (err) {
      toast.error('Message could not be deleted');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-login-logo">AH</div>
          <h2>Admin Panel</h2>
          <p>Sign in to manage your portfolio.</p>

          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">AH</div>
          <div>
            <strong>agshin.xyz</strong>
            <span>Control Panel</span>
          </div>
        </div>

        <nav className="admin-sidebar-menu">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>⌂</span> Dashboard
          </button>

          <button
            className={activeTab === 'messages' ? 'active' : ''}
            onClick={() => setActiveTab('messages')}
          >
            <span>✉</span> Messages
          </button>

          <button
            className={activeTab === 'projects' ? 'active' : ''}
            onClick={() => setActiveTab('projects')}
          >
            <span>▣</span> Projects
          </button>
        </nav>

        <button onClick={handleLogout} className="admin-sidebar-logout">
          <span>↳</span> Logout
        </button>
      </aside>

      <main className="admin-main">
        {activeTab === 'dashboard' && (
          <section className="admin-view">
            <div className="admin-page-heading">
              <p>Overview</p>
              <h1>Welcome back, Agshin.</h1>
            </div>

            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span>Total Messages</span>
                <strong>{messages.length}</strong>
              </div>

              <div className="admin-stat-card">
                <span>Live Projects</span>
                <strong>{projects.length}</strong>
              </div>

              <div className="admin-stat-card">
                <span>Server Status</span>
                <strong className="status-good">Active</strong>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="admin-view">
            <div className="admin-page-heading">
              <p>Inbox</p>
              <h1>Messages</h1>
            </div>

            <div className="admin-list">
              {messages.length === 0 ? (
                <div className="admin-empty">No messages yet.</div>
              ) : (
                messages.map((message) => (
                  <article key={message._id} className="admin-message-card">
                    <div className="admin-message-top">
                      <div>
                        <h3>{message.name}</h3>
                        <a href={`mailto:${message.email}`}>{message.email}</a>
                      </div>

                      <button onClick={() => deleteMessage(message._id)} className="admin-danger-btn">
                        Delete
                      </button>
                    </div>

                    <p>{message.text}</p>

                    <span className="admin-date">
                      {message.createdAt ? new Date(message.createdAt).toLocaleString() : 'No date'}
                    </span>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'projects' && (
          <section className="admin-view">
            <div className="admin-page-heading">
              <p>Portfolio</p>
              <h1>{editingId ? 'Edit Project' : 'Manage Projects'}</h1>
            </div>

            <form onSubmit={saveProject} className="admin-project-form">
              <div className="admin-form-grid">
                <input
                  type="text"
                  placeholder="Project title"
                  value={projectForm.title}
                  onChange={(e) => handleProjectChange('title', e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Project type"
                  value={projectForm.type}
                  onChange={(e) => handleProjectChange('type', e.target.value)}
                />
              </div>

              <textarea
                placeholder="Short description"
                value={projectForm.description}
                onChange={(e) => handleProjectChange('description', e.target.value)}
                required
              />

              <textarea
                placeholder="Detailed description"
                value={projectForm.detailedDescription}
                onChange={(e) => handleProjectChange('detailedDescription', e.target.value)}
              />

              <div className="admin-tags-input">
                {projectForm.stack.map((tag, index) => (
                  <span key={`${tag}-${index}`}>
                    {tag}
                    <button type="button" onClick={() => removeTag(index)}>×</button>
                  </span>
                ))}

                <input
                  type="text"
                  placeholder="Add stack and press Enter"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>

              <div className="admin-form-grid">
                <input
                  type="url"
                  placeholder="GitHub link"
                  value={projectForm.githubLink}
                  onChange={(e) => handleProjectChange('githubLink', e.target.value)}
                />

                <input
                  type="url"
                  placeholder="Live link"
                  value={projectForm.liveLink}
                  onChange={(e) => handleProjectChange('liveLink', e.target.value)}
                />
              </div>

              <div className="admin-form-actions">
                <button type="submit" className="admin-primary-btn">
                  {editingId ? 'Update Project' : 'Save Project'}
                </button>

                {editingId && (
                  <button type="button" onClick={resetProjectForm} className="admin-secondary-btn">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="admin-project-list">
              {projects.length === 0 ? (
                <div className="admin-empty">No projects yet.</div>
              ) : (
                projects.map((project) => (
                  <article key={project._id} className="admin-project-card">
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.type || 'Web Project'}</p>
                    </div>

                    <div className="admin-card-actions">
                      <button onClick={() => startEditProject(project)} className="admin-secondary-btn">
                        Edit
                      </button>

                      <button onClick={() => deleteProject(project._id)} className="admin-danger-btn">
                        Delete
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;
