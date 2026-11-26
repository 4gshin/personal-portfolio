import React, { useState } from 'react';
import { motion } from 'framer-motion';

const projectCovers = {
  '4gshin/flowershop': '/flowershop-preview.webp',
  '4gshin/personal-portfolio': '/portfolio-v1-preview.webp',
  '4gshin/react-todo-app': '/todo-preview.webp'
};

function getCoverSources(project) {
  const repository = project.githubLink?.match(/^https:\/\/github\.com\/([^/#?]+\/[^/#?]+)/i)?.[1];
  const bundledCover = projectCovers[repository?.replace(/\.git$/i, '').toLowerCase()];
  const customCover = /^https:\/\//i.test(project.imageUrl || '') ? project.imageUrl : null;
  return [...new Set([customCover, bundledCover].filter(Boolean))];
}

function ProjectCover({ sources }) {
  const [failedCount, setFailedCount] = useState(0);
  const source = sources[failedCount];

  if (!source) return null;

  return (
    <img
      className="project-card-image"
      src={source}
      alt=""
      width="1152"
      height="585"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedCount(failedCount + 1)}
    />
  );
}

// Tək layihə kartı — Home-dakı "Featured Projects" grid-i ilə
// /projects səhifəsindəki tam siyahı eyni kartı istifadə edir.
const ProjectCard = ({ project, index = 0, onClick }) => {
  const covers = getCoverSources(project);
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
      <ProjectCover key={JSON.stringify(covers)} sources={covers} />
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
