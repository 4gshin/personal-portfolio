import React from 'react';
import { motion } from 'framer-motion';

import ProjectCover from './ProjectCover.jsx';

// Tək layihə kartı — Home-dakı "Featured Projects" grid-i ilə
// /projects səhifəsindəki tam siyahı eyni kartı istifadə edir.
const ProjectCard = ({ project, index = 0, onClick }) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div
      className="project-card"
      {...fadeInUp}
      transition={{ delay: index * 0.08 }}
    >
      <ProjectCover project={project} />
      <div className="card-content">
        <span className="project-type">{project.type}</span>
        <h3>
          <button type="button" className="project-card-link" onClick={onClick}>
            {project.title}
          </button>
        </h3>
        <p>{project.description}</p>
        <div className="project-stack">
          {project.stack?.map((s, j) => (
            <span key={j} className="mini-pill">{s}</span>
          ))}
        </div>
        <span className="project-card-arrow" aria-hidden="true">↗</span>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
