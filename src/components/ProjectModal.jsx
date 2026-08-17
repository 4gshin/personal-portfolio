import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Seçilmiş layihənin detallarını göstərən modal.
// Həm Home, həm də /projects səhifəsi bunu paylaşır.
const ProjectModal = ({ project, onClose }) => {
  return (
    <AnimatePresence>
      {project && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={onClose}>×</button>
            <span className="project-type">{project.type}</span>
            <h2>{project.title}</h2>
            <div className="modal-body">
              <p>{project.detailedDescription || project.description}</p>
              <div className="project-stack" style={{ marginTop: '20px' }}>
                {project.stack?.map((s, j) => (
                  <span key={j} className="mini-pill">{s}</span>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              {project.githubLink && (
                <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn btn-secondary">GitHub</a>
              )}
              {project.liveLink && (
                <a href={project.liveLink} target="_blank" rel="noreferrer" className="btn btn-primary">Live Demo</a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
