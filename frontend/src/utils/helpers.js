// Format date to relative time
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};

// Generate random ID for new tickets
export const generateId = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Get priority color class
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'priority-high';
    case 'medium': return 'priority-medium';
    case 'low': return 'priority-low';
    default: return 'text-gray-600';
  }
};

// Get status color class
export const getStatusColor = (status) => {
  switch (status) {
    case 'open': return 'status-open';
    case 'in-progress': return 'status-in-progress';
    case 'resolved': return 'status-resolved';
    default: return 'bg-gray-100 text-gray-600';
  }
};