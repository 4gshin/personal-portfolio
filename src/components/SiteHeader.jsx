import React from 'react';
import { Link } from 'react-router-dom';

// Ana səhifə və /projects səhifəsi arasında paylaşılan başlıq.
// Bölmə linkləri "/#projects" formatındadır ki, hansı səhifədə olursansa ol
// düzgün işləsin (ana səhifədəsənsə birbaşa scroll, başqa səhifədəsənsə əvvəl ana səhifəyə keçir).
const SiteHeader = () => (
  <header className="site-header">
    <div className="container nav-row">
      <Link to="/" className="brand">AGSHIN</Link>
      <nav className="nav-links">
        <a href="/#projects">Projects</a>
        <a href="/#about">About</a>
        <a href="/#contact">Contact</a>
      </nav>
    </div>
  </header>
);

export default SiteHeader;
