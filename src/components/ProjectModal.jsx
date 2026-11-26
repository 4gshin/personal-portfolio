import React, { useEffect, useId, useRef } from 'react';
import ProjectCover from './ProjectCover.jsx';

export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);
  const headingId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (project && !dialog.open) dialog.showModal();
    if (!project && dialog.open) dialog.close();
  }, [project]);

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby={headingId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {project && (
        <article className="project-dialog-content">
          <header className="project-dialog-header">
            <div>
              <span className="project-type">{project.type}</span>
              <h2 id={headingId}>{project.title}</h2>
            </div>
            <button type="button" className="project-dialog-close" aria-label="Close project details" onClick={onClose}>
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <ProjectCover project={project} alt={project.title + ' screenshot'} loading="eager" />
          <div className="project-dialog-body">
            <p>{project.detailedDescription || project.description}</p>
            {project.stack?.length > 0 && (
              <ul className="project-stack" aria-label="Technologies">
                {project.stack.map((item, index) => (
                  <li key={index} className="mini-pill">{item}</li>
                ))}
              </ul>
            )}
            {(project.githubLink || project.liveLink) && (
              <div className="project-dialog-actions">
                {project.liveLink && (
                  <a href={project.liveLink} target="_blank" rel="noreferrer" className="btn btn-primary">Live Demo</a>
                )}
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" rel="noreferrer" className="btn btn-secondary">View on GitHub</a>
                )}
              </div>
            )}
          </div>
        </article>
      )}
    </dialog>
  );
}
