import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicketCount, setNewTicketCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    avgRating: 0
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Poll for new tickets every 30 seconds
    const interval = setInterval(checkForNewTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch tickets
      const ticketsResponse = await fetch('http://localhost:5001/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData.tickets || []);
        calculateStats(ticketsData.tickets || []);
      }

      // Fetch users
      const usersResponse = await fetch('http://localhost:5001/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const checkForNewTickets = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5001/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const newTickets = data.tickets || [];
        
        // Check for new tickets since last check
        const currentTicketIds = tickets.map(t => t.id);
        const reallyNewTickets = newTickets.filter(t => !currentTicketIds.includes(t.id));
        
        if (reallyNewTickets.length > 0) {
          setNewTicketCount(prev => prev + reallyNewTickets.length);
          
          // Show popup for each new ticket
          reallyNewTickets.forEach(ticket => {
            toast.info(`🎫 New ticket submitted: ${ticket.title}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          });
          
          setTickets(newTickets);
          calculateStats(newTickets);
        }
      }
    } catch (error) {
      console.error('Error checking for new tickets:', error);
    }
  };

  const calculateStats = (ticketsData) => {
    const total = ticketsData.length;
    const open = ticketsData.filter(t => t.status === 'Open').length;
    const inProgress = ticketsData.filter(t => t.status.includes('Progress') || t.status.includes('Review')).length;
    const resolved = ticketsData.filter(t => t.status === 'Resolved').length;
    
    const ratedTickets = ticketsData.filter(t => t.rating?.score);
    const avgRating = ratedTickets.length > 0 
      ? (ratedTickets.reduce((sum, t) => sum + t.rating.score, 0) / ratedTickets.length).toFixed(1)
      : 0;

    setStats({ total, open, inProgress, resolved, avgRating });
  };

  // Auto-mark ticket as viewed when admin clicks on it
  const viewTicket = async (ticket) => {
    setSelectedTicket(ticket);
    
    // Auto-update status to "Being Reviewed" when admin views for the first time
    if (ticket.status === 'Open') {
      await updateTicketStatus(ticket.id, 'Being Reviewed - Will be attended to shortly', '', true);
      
      // Show popup notification
      toast.success(`✅ Ticket ${ticket.ticket_number} marked as "Being Reviewed"`, {
        position: "top-center",
        autoClose: 3000,
      });
    }
    
    // Decrease new ticket count
    if (newTicketCount > 0) {
      setNewTicketCount(prev => Math.max(0, prev - 1));
    }
  };

  const updateTicketStatus = async (ticketId, newStatus, resolution = '', isAutoUpdate = false) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5001/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus, 
          resolution,
          internal_notes: isAutoUpdate 
            ? `Automatically marked as reviewed when viewed by ${user.name}` 
            : `Status updated by ${user.name}`,
          auto_update: isAutoUpdate
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (!isAutoUpdate) {
          toast.success(`🔄 ${data.message}`, {
            position: "top-center",
            autoClose: 3000,
          });
        }
        
        fetchDashboardData(); // Refresh data
        
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({...selectedTicket, status: newStatus});
        }
        
        // Show different popups based on status
        if (newStatus === 'Resolved') {
          toast.success(`🎉 Ticket resolved! User can now rate your service.`, {
            position: "top-center",
            autoClose: 4000,
          });
        } else if (newStatus === 'In Progress') {
          toast.info(`🔧 Working on ticket. User has been notified.`, {
            position: "top-center",
            autoClose: 3000,
          });
        }
        
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800 animate-pulse'; // Add pulse for new tickets
      case 'Assigned': 
      case 'In Progress':
      case 'Being Reviewed - Will be attended to shortly': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 font-bold';
      case 'Medium': return 'text-yellow-600 font-semibold';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">IT Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* New Ticket Notification Badge */}
              {newTicketCount > 0 && (
                <div className="flex items-center bg-red-100 px-3 py-1 rounded-full animate-bounce">
                  <svg className="h-4 w-4 text-red-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                  </svg>
                  <span className="text-sm font-medium text-red-800">{newTicketCount} New Ticket{newTicketCount > 1 ? 's' : ''}</span>
                </div>
              )}
              
              <div className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
                <svg className="h-4 w-4 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-blue-800">IT Specialist</span>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.open}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">My Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.avgRating}/5</p>
                <p className="text-xs text-gray-500">Service Quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Ticket Management</h2>
              {newTicketCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {newTicketCount} New
                </span>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className={`hover:bg-gray-50 ${ticket.status === 'Open' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {ticket.status === 'Open' && (
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.ticket_number}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {ticket.creator_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                        {ticket.priority === 'High' && (
                          <svg className="inline h-4 w-4 text-red-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {ticket.rating ? (
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 text-sm text-gray-600">{ticket.rating.score}/5</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not rated</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => viewTicket(ticket)}
                        className={`text-blue-600 hover:text-blue-900 mr-4 ${ticket.status === 'Open' ? 'font-bold' : ''}`}
                      >
                        {ticket.status === 'Open' ? 'View & Review' : 'View/Update'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal - keeping existing modal code but adding auto-status update notification */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Ticket Details - {selectedTicket.ticket_number}
                </h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedTicket.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <p className={`mt-1 text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTicket.category}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Status</label>
                  <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Status Update Actions */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.status.includes('Review') && (
                      <button
                        onClick={() => updateTicketStatus(selectedTicket.id, 'In Progress')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        🔧 Start Working
                      </button>
                    )}
                    
                    {selectedTicket.status !== 'Resolved' && (
                      <button
                        onClick={() => {
                          const resolution = prompt('Enter resolution details:');
                          if (resolution) {
                            updateTicketStatus(selectedTicket.id, 'Resolved', resolution);
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        ✅ Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Rating Display */}
                {selectedTicket.rating && (
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700">Service Rating</label>
                    <div className="mt-1 flex items-center">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-5 w-5 ${star <= selectedTicket.rating.score ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {selectedTicket.rating.score}/5
                        </span>
                      </div>
                    </div>
                    {selectedTicket.rating.feedback && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">Customer Feedback:</p>
                        <p className="mt-1 text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          "{selectedTicket.rating.feedback}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}