// Local Storage Database Mock
class LocalStorageDB {
  constructor() {
    this.initializeStorage();
  }

  initializeStorage() {
    // Initialize storage keys if they don't exist
    const storageKeys = ['users', 'tickets', 'sessions', 'settings'];
    
    storageKeys.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });

    // Initialize settings if empty
    if (!localStorage.getItem('app_settings')) {
      localStorage.setItem('app_settings', JSON.stringify({
        initialized: true,
        version: '2.0.0',
        lastLogin: null,
        theme: 'leopard-pro'
      }));
    }

    // Create admin user if no users exist
    this.createDefaultUsers();
  }

  createDefaultUsers() {
    const users = this.getUsers();
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: this.generateId(),
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@capaciti.com',
          password: this.hashPassword('admin123'),
          phone: '0123456789',
          role: 'it_specialist',
          userType: 'it_specialist',
          department: 'Information Technology',
          isAutoCreated: false,
          isVerified: true,
          createdAt: new Date().toISOString(),
          lastLogin: null
        },
        {
          id: this.generateId(),
          firstName: 'Demo',
          lastName: 'Employee',
          email: 'employee@capaciti.com',
          password: this.hashPassword('demo123'),
          phone: '0987654321',
          role: 'employee',
          userType: 'employee',
          department: 'Software Development',
          isAutoCreated: false,
          isVerified: true,
          createdAt: new Date().toISOString(),
          lastLogin: null
        },
        {
          id: this.generateId(),
          firstName: 'Test',
          lastName: 'Visitor',
          email: 'visitor@example.com',
          password: this.hashPassword('test123'),
          phone: '0555123456',
          role: 'visitor',
          userType: 'visitor',
          company: 'Test Company',
          visitPurpose: 'Technical Support',
          isAutoCreated: false,
          isVerified: true,
          createdAt: new Date().toISOString(),
          lastLogin: null
        }
      ];

      localStorage.setItem('users', JSON.stringify(defaultUsers));
      console.log('✅ Default users created for testing');
    }
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  hashPassword(password) {
    // Simple hash for demo purposes (in real app, use proper hashing)
    return btoa(password + 'capaciti_salt');
  }

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  }

  // User operations
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem('users') || '[]');
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find(user => user.id === id);
  }

  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    try {
      const users = this.getUsers();
      
      // Check if user already exists
      const existingUser = this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate required fields
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
        throw new Error('Missing required fields');
      }

      // Create new user
      const newUser = {
        id: this.generateId(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email.toLowerCase(),
        password: this.hashPassword(userData.password),
        phone: userData.phone || '',
        role: userData.role || 'visitor',
        userType: userData.role || 'visitor',
        department: userData.department || null,
        officeLocation: userData.officeLocation || null,
        deskNumber: userData.deskNumber || null,
        employeeId: userData.employeeId || null,
        company: userData.company || null,
        visitPurpose: userData.visitPurpose || null,
        adminLevel: userData.adminLevel || 'standard',
        isAutoCreated: false,
        isVerified: true,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Remove password from returned user
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  authenticateUser(email, password) {
    try {
      const user = this.getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (!this.verifyPassword(password, user.password)) {
        throw new Error('Invalid password');
      }

      // Update last login
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Remove password from returned user
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  updateUser(id, updateData) {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Update user data
      users[userIndex] = { ...users[userIndex], ...updateData, updatedAt: new Date().toISOString() };
      localStorage.setItem('users', JSON.stringify(users));

      const { password, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Session operations
  createSession(userId) {
    try {
      const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      const sessionToken = this.generateId();
      
      const session = {
        id: sessionToken,
        userId: userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };

      sessions.push(session);
      localStorage.setItem('sessions', JSON.stringify(sessions));
      
      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  getSession(token) {
    try {
      const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      const session = sessions.find(s => s.id === token);
      
      if (!session) return null;
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        this.deleteSession(token);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  deleteSession(token) {
    try {
      const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      const filteredSessions = sessions.filter(s => s.id !== token);
      localStorage.setItem('sessions', JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  // Ticket operations
  getTickets(userId = null, role = null) {
    try {
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      
      if (!userId || role === 'it_specialist') {
        return tickets; // IT specialists see all tickets
      }
      
      // Other users see only their tickets
      return tickets.filter(ticket => ticket.createdBy === userId);
    } catch (error) {
      console.error('Error getting tickets:', error);
      return [];
    }
  }

  createTicket(ticketData) {
    try {
      const tickets = this.getTickets();
      
      const newTicket = {
        id: this.generateId(),
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category || 'General',
        priority: ticketData.priority || 'Medium',
        urgency: ticketData.urgency || 'Normal',
        status: 'Open',
        createdBy: ticketData.createdBy,
        assignedTo: null,
        resolution: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
        estimatedResolutionTime: this.calculateEstimatedTime(ticketData.priority, ticketData.urgency),
        updates: [],
        attachments: [],
        rating: null
      };

      tickets.push(newTicket);
      localStorage.setItem('tickets', JSON.stringify(tickets));
      
      return newTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  updateTicket(id, updateData) {
    try {
      const tickets = this.getTickets();
      const ticketIndex = tickets.findIndex(ticket => ticket.id === id);
      
      if (ticketIndex === -1) {
        throw new Error('Ticket not found');
      }

      tickets[ticketIndex] = { 
        ...tickets[ticketIndex], 
        ...updateData, 
        updatedAt: new Date().toISOString() 
      };
      
      localStorage.setItem('tickets', JSON.stringify(tickets));
      return tickets[ticketIndex];
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  calculateEstimatedTime(priority, urgency) {
    const timeMap = {
      'High': { 'Urgent': '2 hours', 'Normal': '4 hours' },
      'Medium': { 'Urgent': '8 hours', 'Normal': '24 hours' },
      'Low': { 'Urgent': '24 hours', 'Normal': '72 hours' }
    };
    return timeMap[priority]?.[urgency] || '24 hours';
  }

  // Statistics
  getStats(userId = null, role = null) {
    try {
      const tickets = this.getTickets(userId, role);
      
      return {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved').length,
        closed: tickets.filter(t => t.status === 'Closed').length,
        highPriority: tickets.filter(t => t.priority === 'High').length,
        avgResolutionTime: this.calculateAverageResolutionTime(tickets),
        avgRating: this.calculateAverageRating(tickets)
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        highPriority: 0,
        avgResolutionTime: '0 hours',
        avgRating: 0
      };
    }
  }

  calculateAverageResolutionTime(tickets) {
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved' && t.resolvedAt);
    if (resolvedTickets.length === 0) return '0 hours';
    
    const totalHours = resolvedTickets.reduce((sum, ticket) => {
      const created = new Date(ticket.createdAt);
      const resolved = new Date(ticket.resolvedAt);
      const hours = (resolved - created) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    const avgHours = (totalHours / resolvedTickets.length).toFixed(1);
    return `${avgHours} hours`;
  }

  calculateAverageRating(tickets) {
    const ratedTickets = tickets.filter(t => t.rating?.score);
    if (ratedTickets.length === 0) return 0;
    
    const totalRating = ratedTickets.reduce((sum, t) => sum + t.rating.score, 0);
    return (totalRating / ratedTickets.length).toFixed(1);
  }

  // Utility methods
  clearAllData() {
    const keys = ['users', 'tickets', 'sessions', 'app_settings'];
    keys.forEach(key => localStorage.removeItem(key));
    this.initializeStorage();
    console.log('✅ Local storage cleared and reinitialized');
  }

  exportData() {
    const data = {
      users: this.getUsers(),
      tickets: this.getTickets(),
      sessions: JSON.parse(localStorage.getItem('sessions') || '[]'),
      settings: JSON.parse(localStorage.getItem('app_settings') || '{}'),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
      if (data.tickets) localStorage.setItem('tickets', JSON.stringify(data.tickets));
      if (data.sessions) localStorage.setItem('sessions', JSON.stringify(data.sessions));
      if (data.settings) localStorage.setItem('app_settings', JSON.stringify(data.settings));
      
      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Debug methods
  debugInfo() {
    return {
      users: this.getUsers().length,
      tickets: this.getTickets().length,
      sessions: JSON.parse(localStorage.getItem('sessions') || '[]').length,
      storageUsed: new Blob([this.exportData()]).size,
      lastInitialized: JSON.parse(localStorage.getItem('app_settings') || '{}').initialized
    };
  }
}

// Create global instance
const localDB = new LocalStorageDB();

// Export for use in other modules
export default localDB;