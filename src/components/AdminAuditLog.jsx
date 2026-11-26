import { useEffect, useState } from 'react';

const actionLabels = {
  login: 'Admin sign-in',
  logout: 'Admin sign-out',
  'project.create': 'Create project',
  'project.update': 'Update project',
  'project.delete': 'Delete project',
  'message.delete': 'Delete message'
};

const outcomeLabels = {
  success: 'Successful',
  failure: 'Failed'
};

export default function AdminAuditLog({ apiBase }) {
  const [request, setRequest] = useState({ before: null });
  const [page, setPage] = useState({ status: 'loading', events: [], nextCursor: null });

  useEffect(() => {
    const controller = new AbortController();
    const query = request.before ? `?before=${encodeURIComponent(request.before)}` : '';

    async function loadEvents() {
      try {
        const response = await fetch(`${apiBase}/admin/audit-log${query}`, {
          credentials: 'include',
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Could not load audit log.');
        const { events, nextCursor } = await response.json();
        if (controller.signal.aborted) return;
        setPage((current) => ({
          status: 'ready',
          events: request.before ? [...current.events, ...events] : events,
          nextCursor
        }));
      } catch {
        if (!controller.signal.aborted) {
          setPage((current) => ({ ...current, status: 'error' }));
        }
      }
    }

    loadEvents();
    return () => controller.abort();
  }, [apiBase, request]);

  function loadPage(before) {
    setPage((current) => ({ ...current, status: 'loading' }));
    setRequest({ before });
  }

  return (
    <section className="admin-view">
      <div className="admin-page-heading admin-audit-heading">
        <h1>Audit Log</h1>
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={() => loadPage(null)}
          disabled={page.status === 'loading'}
        >
          Refresh
        </button>
      </div>

      {page.events.length > 0 && (
        <ul className="admin-list admin-audit-list">
          {page.events.map((event) => (
            <li className="admin-message-card admin-audit-event" key={event._id}>
              <div>
                <strong>{actionLabels[event.action] ?? event.action}</strong>
                <div className="admin-audit-details">
                  <time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time>
                  {event.actor && <span>By {event.actor}</span>}
                  {event.targetId && <span>Record {event.targetId}</span>}
                </div>
              </div>
              <span className={event.outcome === 'success' ? 'status-good' : 'admin-audit-warning'}>
                {outcomeLabels[event.outcome] ?? event.outcome}
              </span>
            </li>
          ))}
        </ul>
      )}

      {page.status === 'loading' && <p role="status">Loading audit events…</p>}
      {page.status === 'error' && (
        <div className="admin-audit-heading">
          <p role="alert">Audit events could not be loaded.</p>
          <button type="button" className="admin-secondary-btn" onClick={() => loadPage(request.before)}>
            Retry
          </button>
        </div>
      )}
      {page.status === 'ready' && page.events.length === 0 && (
        <div className="admin-empty">No audit events yet.</div>
      )}
      {page.status === 'ready' && page.nextCursor && (
        <button type="button" className="admin-secondary-btn" onClick={() => loadPage(page.nextCursor)}>
          Load older events
        </button>
      )}
    </section>
  );
}
