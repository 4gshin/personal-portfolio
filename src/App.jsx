import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Admin from './pages/Admin.jsx';
import Projects from './pages/Projects.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import ProjectCard from './components/ProjectCard.jsx';
import ProjectModal from './components/ProjectModal.jsx';
import { useProjects } from './hooks/useProjects.js';
import toast, { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react";
import './App.css';

const getApiUrl = () => import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Ana səhifədə maksimum neçə layihə göstərilsin (admin paneldən "featured" seçilənlər,
// heç biri seçilməyibsə isə ən son əlavə olunanlar).
const FEATURED_LIMIT = 3;
const CORE_STACK = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
  'PostgreSQL', 'Prisma', 'MongoDB', 'PostGIS'
];

// Admin paneldən verilən "order" dəyərinə görə sıralayır (1 = birinci).
// order verilməyib / 0-dırsa, o layihə sıra siyahısının sonuna düşür və
// öz aralarında API-dan gələn sıra (createdAt desc) qorunur.
const sortByOrder = (a, b) => {
  const orderA = a.order || 0;
  const orderB = b.order || 0;
  if (orderA === 0 && orderB === 0) return 0;
  if (orderA === 0) return 1;
  if (orderB === 0) return -1;
  return orderA - orderB;
};

// --- HOME KOMPONENTİ ---
const Home = () => {
  const [formData, setFormData] = useState({ name: '', email: '', text: '' });
  const { projects: dbProjects, loading } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);
  const API_BASE = getApiUrl();

  // Admin paneldə "featured" işarələnmiş layihələri, təyin olunan "order" sırası ilə göstəririk.
  // Heç biri işarələnməyibsə, ən son əlavə olunan layihələr geri qayıdır (DB sort: createdAt desc).
  const featuredProjects = dbProjects.filter((p) => p.featured).sort(sortByOrder);
  const displayProjects = (featuredProjects.length > 0 ? featuredProjects : dbProjects).slice(0, FEATURED_LIMIT);

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
        toast.success("Message sent!", {
          style: { background: '#18181b', color: '#fff', border: '1px solid #27272a' }
        });
        setFormData({ name: '', email: '', text: '' });
      }
    } catch (error) { toast.error("Server connection error!"); }
  };

  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

  return (
    <div className="page-shell">
      <SiteHeader />

      <main>
        <section className="hero-section">
          <div className="container hero-content">
            <div className="hero-intro">
              <p className="hero-role">Full-stack developer · Ankara</p>
              <h1 className="hero-title">Agshin<br />Heybatli<span>.</span></h1>
              <p className="hero-text">Software engineering student at OSTİM Technical University. I build web apps from the interface to the database.</p>
              <div className="hero-actions">
                <a href="#projects" className="btn btn-primary">View Projects <span aria-hidden="true">↓</span></a>
                <a href="#contact" className="btn btn-secondary">Contact Me</a>
              </div>
            </div>

            <a className="hero-showcase" href="https://flowershop-flax.vercel.app/" target="_blank" rel="noreferrer" aria-label="Open the FlowerShop live demo">
              <div className="showcase-bar" aria-hidden="true">
                <span className="showcase-dots"><i /><i /><i /></span>
                <span>FlowerShop</span>
                <span>↗</span>
              </div>
              <img src="/flowershop-preview.webp" alt="FlowerShop storefront homepage" width="1152" height="585" fetchPriority="high" />
              <div className="showcase-caption">
                <span>E-commerce storefront</span>
                <span>Live demo <span aria-hidden="true">↗</span></span>
              </div>
            </a>
          </div>
        </section>

        <section id="projects" className="section-block">
          <div className="container">
            <motion.div className="section-heading" {...fadeInUp}>
              <h2>Featured Projects</h2>
            </motion.div>
            {loading && <p className="projects-loading" role="status">Loading projects…</p>}
            {!loading && displayProjects.length === 0 && (
              <p className="projects-loading">No featured projects to display.</p>
            )}
            <div className="projects-grid">
              {displayProjects.map((p, i) => (
                <ProjectCard
                  key={p._id || i}
                  project={p}
                  index={i}
                  onClick={() => setSelectedProject(p)}
                />
              ))}
            </div>
            {dbProjects.length > 0 && (
              <div className="view-all-wrap">
                <Link to="/projects" className="btn btn-secondary">View All Projects</Link>
              </div>
            )}
          </div>
        </section>

        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

        <section id="about" className="section-block about-section">
          <div className="container about-container-lg">
            <motion.div className="about-text-side" {...fadeInUp}>
              <p className="section-kicker">About Me</p>
              <h2 className="about-title-lg">Driven by design, guided by code.</h2>
              <div className="about-description-lg">
                <p>I’m a software engineering student at OSTİM Technical University in Ankara, with a focus on full-stack web development. What draws me to it is seeing how the interface, server, and database fit together to make an app easy to use and maintain.</p>
              </div>
              <div className="stack-wrap-lg">
                {CORE_STACK.map(technology => (
                  <span key={technology} className="stack-pill-lg">{technology}</span>
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
                      <label htmlFor="contact-name">Full Name</label>
                      <input id="contact-name" type="text" placeholder="Agshin Heybatli" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="input-group">
                      <label htmlFor="contact-email">Email Address</label>
                      <input id="contact-email" type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="contact-message">Message</label>
                    <textarea id="contact-message" placeholder="How can I help you?" rows="6" value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} required></textarea>
                  </div>
                  <motion.button type="submit" className="btn btn-primary send-btn" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>Send Message</motion.button>
                </form>
              </div>

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

      <SiteFooter />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-left" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
