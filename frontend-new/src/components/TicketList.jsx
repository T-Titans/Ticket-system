import React, { useEffect, useState } from 'react';
import API from '../api';

const TicketList = ({ refreshKey }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    return () => {};
  }, [refreshKey]);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/tickets/${id}`, { status });
      fetchTickets();
    } catch (err) {
      alert('Failed to update');
    }
  };

  const assign = async (id) => {
    const agent = prompt('Assign to (agent id or name):');
    if (!agent) return;
    try {
      await API.patch(`/tickets/${id}`, { assignedTo: agent });
      fetchTickets();
    } catch (err) {
      alert('Failed to assign');
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!tickets.length) return <p>No tickets yet.</p>;

  return (
    <div className="list">
      {tickets.map(t => (
        <div className="ticket-card" key={t.id}>
          <div className="ticket-top">
            <h4>{t.title}</h4>
            <div className={`badge status-${t.status.replace(/\s+/g, '-').toLowerCase()}`}>{t.status}</div>
          </div>
          <p>{t.description}</p>
          <div className="meta">
            <span>Priority: {t.priority}</span>
            <span>Category: {t.category}</span>
            {t.assignedTo && <span>Assigned: {typeof t.assignedTo === 'string' ? t.assignedTo : t.assignedTo?.name || ''}</span>}
          </div>

          {role === 'support' && (
            <div className="actions">
              <select defaultValue={t.status} onChange={(e) => updateStatus(t.id, e.target.value)}>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <button onClick={() => assign(t.id)} className="btn-secondary">Assign</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TicketList;
