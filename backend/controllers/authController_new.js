const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

// Professional Authentication Controller - Clean Exports
const authController = {
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, phone, password, confirmPassword, role = 'visitor' } = req.body;

      console.log('🚀 Registration attempt for:', email);

      // Basic validation
      if (!firstName || !lastName || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }

      if (password.length < 12) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 12 characters long'
        });
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, phone_number')
        .or(`email.eq.${email},phone_number.eq.${phone.replace(/\D/g, '')}`)
        .maybeSingle();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email or phone number'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);
      const cleanPhone = phone.replace(/\D/g, '');

      // Create user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          phone_number: cleanPhone,
          password_hash: passwordHash,
          user_type: role,
          status: 'active',
          email_verified: false,
          auto_created: false
        })
        .select('id, first_name, last_name, email, phone_number, user_type, status')
        .single();

      if (createError) {
        console.error('Database error:', createError);
        return res.status(500).json({
          success: false,
          message: 'Registration failed',
          error: createError.message
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, userType: newUser.user_type },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ User registered:', newUser.email);

      res.status(201).json({
        success: true,
        message: '🎉 Registration successful! Welcome to Capaciti!',
        user: {
          id: newUser.id,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          name: `${newUser.first_name} ${newUser.last_name}`,
          email: newUser.email,
          phone: newUser.phone_number,
          userType: newUser.user_type,
          role: newUser.user_type,
          status: newUser.status
        },
        token,
        redirect_to: getDashboardRoute(newUser.user_type)
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, phone } = req.body;
      const identifier = email || phone;

      console.log('🔐 Login attempt for:', identifier);

      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/phone and password are required'
        });
      }

      // Find user
      let query = supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number, password_hash, user_type, status')
        .eq('status', 'active');

      if (identifier.includes('@')) {
        query = query.eq('email', identifier.toLowerCase());
      } else {
        const cleanPhone = identifier.replace(/\D/g, '');
        query = query.eq('phone_number', cleanPhone);
      }

      const { data: user, error: findError } = await query.maybeSingle();

      if (findError || !user) {
        return res.status(401).json({
          success: false,
          message: 'No account found. Please register first.'
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, userType: user.user_type },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ User logged in:', user.email);

      res.json({
        success: true,
        message: '🚀 Welcome back! Login successful!',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone_number,
          userType: user.user_type,
          role: user.user_type,
          status: user.status
        },
        token,
        redirect_to: getDashboardRoute(user.user_type)
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  },

  logout: async (req, res) => {
    res.json({
      success: true,
      message: '👋 Logout successful'
    });
  },

  verify: async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number, user_type, status')
        .eq('id', decoded.id)
        .single();

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone_number,
          userType: user.user_type,
          role: user.user_type,
          status: user.status
        }
      });

    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  }
};

function getDashboardRoute(userType) {
  const routes = {
    'admin': '/admin-dashboard',
    'it_specialist': '/admin-dashboard',
    'employee': '/employee-dashboard',
    'visitor': '/visitor-dashboard'
  };
  return routes[userType] || '/dashboard';
}

module.exports = authController;