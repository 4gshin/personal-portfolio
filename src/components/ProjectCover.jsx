import React, { useState } from 'react';

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

function CoverImage({ sources, alt, loading }) {
  const [failedCount, setFailedCount] = useState(0);
  const source = sources[failedCount];

  if (!source) return null;

  return (
    <img
      className="project-card-image"
      src={source}
      alt={alt}
      width="1152"
      height="585"
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedCount(count => count + 1)}
    />
  );
}

export default function ProjectCover({ project, alt = '', loading = 'lazy' }) {
  const sources = getCoverSources(project);

  return <CoverImage key={JSON.stringify(sources)} sources={sources} alt={alt} loading={loading} />;
}
