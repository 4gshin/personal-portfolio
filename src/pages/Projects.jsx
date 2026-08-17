import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectModal from '../components/ProjectModal.jsx';
import { useProjects } from '../hooks/useProjects.js';
import '../App.css';

// Bütün layihələrin göründüyü tam siyahı səhifəsi.
// Ana səhifədəki "View All Projects" düyməsi bura yönləndirir.
const Projects = () => {
  const { projects, loading } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="page-shell">
      <SiteHeader />

      <main>
        <section className="section-block projects-page-section">
          <div className="container">
            <Link to="/" className="back-link">← Back to Home</Link>

            <motion.div className="section-heading" {...fadeInUp}>
              <p className="section-kicker">All Work</p>
              <h2>Every Project</h2>
            </motion.div>

            {loading ? (
              <div className="projects-loading">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="projects-loading">No projects yet.</div>
            ) : (
              <div className="projects-grid">
                {projects.map((p, i) => (
                  <ProjectCard
                    key={p._id || i}
                    project={p}
                    index={i}
                    onClick={() => setSelectedProject(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      <SiteFooter />
    </div>
  );
};

export default Projects;
