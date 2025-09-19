import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Example fetch: replace with your backend API
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error('Error fetching tickets:', err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ticket Dashboard</h1>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Title</th>
            <th className="px-4 py-2 border-b">Description</th>
            <th className="px-4 py-2 border-b">Category</th>
            <th className="px-4 py-2 border-b">Priority</th>
            <th className="px-4 py-2 border-b">Status</th>
          </tr>
        </thead>

        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4">
                No tickets found.
              </td>
            </tr>
          ) : (
            tickets.map(ticket => (
              <tr key={ticket._id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border-b">{ticket.title}</td>
                <td className="px-4 py-2 border-b">{ticket.description}</td>
                <td className="px-4 py-2 border-b">{ticket.category}</td>
                <td className="px-4 py-2 border-b">
                  <span
                    className={`px-2 py-1 rounded ${
                      ticket.priority === 'high'
                        ? 'bg-red-500 text-white'
                        : ticket.priority === 'medium'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">{ticket.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
