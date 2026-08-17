import { useState, useEffect, useCallback } from 'react';

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// LayihÉ™lÉ™ri backend-dÉ™n Ã§É™kÉ™n paylaÅŸÄ±lan hook.
// HÉ™m ana sÉ™hifÉ™ (featured siyahÄ±), hÉ™m dÉ™ /projects (tam siyahÄ±) bunu istifadÉ™ edir.
export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = getApiUrl();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/projects`);
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loading, refetch: fetchProjects };
};