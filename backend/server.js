import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Atlas Connected Successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: { 
    type: String, 
    default: 'user',
    enum: ['user', 'support', 'admin']
  }
}, { 
  timestamps: true 
});

const User = mongoose.model('User', userSchema);

// Ticket Schema
const ticketSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  category: {
    type: String,
    enum: ['Software', 'Hardware', 'Network', 'Other'],
    default: 'Software'
  },
  status: { 
    type: String, 
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  timestamps: true 
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// Create demo users on startup
const createDemoUsers = async () => {
  try {
    const demoUsers = [
      { 
        name: 'Demo User', 
        email: 'user@demo.com', 
        password: 'password123', 
        role: 'user' 
      },
      { 
        name: 'Support Agent', 
        email: 'support@demo.com', 
        password: 'password123', 
        role: 'support' 
      },
      { 
        name: 'Admin User', 
        email: 'admin@demo.com', 
        password: 'password123', 
        role: 'admin' 
      }
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = new User({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role
        });
        await user.save();
        console.log(`✅ Created demo ${userData.role}: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('Error creating demo users:', error);
  }
};

// Initialize demo users
connectDB().then(() => {
  createDemoUsers();
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    console.log('📝 Registration attempt:', { name, email, role });
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const allowedRoles = ['user', 'support', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      role 
    });
    
    await user.save();
    
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('✅ User registered successfully:', { email: user.email, role: user.role });
    
    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      message: 'Registration successful'
    });
    
  } catch (error) {
    console.error('🔴 Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email });
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('✅ User logged in successfully:', { email: user.email, role: user.role });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('🔴 Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Ticket Routes
app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const authHeader = req.headers.authorization;
    
    console.log('🎫 Creating ticket:', { title, description, category, priority });
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    const ticket = new Ticket({
      title,
      description,
      category: category || 'Software',
      priority: priority || 'medium',
      createdBy: decoded.userId
    });
    
    await ticket.save();
    await ticket.populate('createdBy', 'name email');
    
    console.log('✅ Ticket created successfully');
    
    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
    
  } catch (error) {
    console.error('🔴 Ticket creation error:', error);
    res.status(500).json({ message: 'Error creating ticket' });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('🎫 Fetching tickets...');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    let tickets;
    if (decoded.role === 'admin' || decoded.role === 'support') {
      // Support agents and admins can see all tickets
      tickets = await Ticket.find()
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Regular users can only see their own tickets
      tickets = await Ticket.find({ createdBy: decoded.userId })
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
    }
    
    console.log(`✅ Found ${tickets.length} tickets for ${decoded.role} role`);
    
    res.json({ tickets });
    
  } catch (error) {
    console.error('🔴 Error fetching tickets:', error);
    res.status(500).json({ message: 'Error fetching tickets' });
  }
});

// Update ticket status and assignment
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Only support agents and admins can update tickets
    if (decoded.role !== 'support' && decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Support agent or admin role required.' });
    }
    
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, assignedTo },
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('assignedTo', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.json({
      message: 'Ticket updated successfully',
      ticket
    });
    
  } catch (error) {
    console.error('🔴 Ticket update error:', error);
    res.status(500).json({ message: 'Error updating ticket' });
  }
});

// Get all support agents (for assignment dropdown)
app.get('/api/support-agents', async (req, res) => {
  try {
    const supportAgents = await User.find({ 
      $or: [{ role: 'support' }, { role: 'admin' }] 
    }).select('name email role');
    
    res.json({ supportAgents });
  } catch (error) {
    console.error('Error fetching support agents:', error);
    res.status(500).json({ message: 'Error fetching support agents' });
  }
});

// Get user profile
app.get('/api/user/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const usersCount = await User.countDocuments();
    const ticketsCount = await Ticket.countDocuments();
    
    res.json({ 
      status: 'OK', 
      database: dbStatus,
      users: usersCount,
      tickets: ticketsCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// Get all users (admin only - for testing)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Basic API endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Ticket System API is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register',
      login: '/api/auth/login',
      profile: '/api/user/profile',
      tickets: '/api/tickets',
      supportAgents: '/api/support-agents',
      users: '/api/users'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`🎫 Tickets: http://localhost:${PORT}/api/tickets`);
  console.log(`🔐 Demo Users:`);
  console.log(`   👤 User: user@demo.com / password123`);
  console.log(`   🔧 Support: support@demo.com / password123`);
  console.log(`   👑 Admin: admin@demo.com / password123`);
});