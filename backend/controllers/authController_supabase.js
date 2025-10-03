const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

// Professional Authentication Controller - Database Based
class AuthController {
  // Register new user (REQUIRED before login)
  async register(req, res) {
    try {
      const {
        firstName, lastName, email, phone, password, confirmPassword,
        role = 'visitor', department, officeLocation, deskNumber,
        employeeId, company, visitPurpose, adminLevel = 'standard'
      } = req.body;

      console.log('🚀 Registration attempt for:', email);

      // Validation
      const errors = this.validateRegistration(req.body);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      // Check if user already exists (email or phone)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, phone_number')
        .or(`email.eq.${email},phone_number.eq.${phone}`)
        .single();

      if (existingUser) {
        const conflictField = existingUser.email === email ? 'email' : 'phone number';
        return res.status(409).json({
          success: false,
          message: `An account with this ${conflictField} already exists. Please login instead.`,
          field: conflictField
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Clean phone number (remove any formatting)
      const cleanPhone = phone.replace(/\D/g, '');

      // Determine user type and role based on registration data
      const userType = this.determineUserType({ role, employeeId, company, email });
      const userRole = this.determineRole(userType);

      // Create user in database
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.toLowerCase().trim(),
          phone_number: cleanPhone,
          password_hash: passwordHash,
          user_type: userType,
          role: userRole,
          department: department || null,
          office_location: officeLocation || null,
          desk_number: deskNumber || null,
          employee_id: employeeId || null,
          company: company || null,
          visit_purpose: visitPurpose || null,
          admin_level: adminLevel,
          status: 'active',
          email_verified: false // In production, require email verification
        })
        .select('id, first_name, last_name, email, phone_number, user_type, role, status')
        .single();

      if (createError) {
        console.error('Database error during registration:', createError);
        return res.status(500).json({
          success: false,
          message: 'Registration failed due to database error',
          error: process.env.NODE_ENV === 'development' ? createError.message : 'Internal server error'
        });
      }

      // Generate JWT token
      const token = this.generateToken(newUser);

      // Create session
      await this.createSession(newUser.id, token, req);

      // Log registration
      await this.logAction(newUser.id, 'REGISTER', 'users', newUser.id, {
        user_type: userType,
        role: userRole,
        ip_address: req.ip
      });

      console.log('✅ User registered successfully:', newUser.email);

      // Return success response
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
          role: newUser.role,
          status: newUser.status
        },
        token,
        redirect_to: this.getDashboardRoute(newUser.user_type)
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Login user (email OR phone number + password)
  async login(req, res) {
    try {
      const { email, password, phone } = req.body;
      const identifier = email || phone; // Can login with either

      console.log('🔐 Login attempt for:', identifier);

      // Validation
      if (!identifier || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email/phone and password are required'
        });
      }

      if (password.length < 12) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 12 characters long'
        });
      }

      // Find user by email or phone
      let query = supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number, password_hash, user_type, role, status, login_attempts, account_locked_until')
        .eq('status', 'active');

      // Determine if identifier is email or phone
      if (identifier.includes('@')) {
        query = query.eq('email', identifier.toLowerCase());
      } else {
        // Clean phone number for comparison
        const cleanPhone = identifier.replace(/\D/g, '');
        query = query.eq('phone_number', cleanPhone);
      }

      const { data: user, error: findError } = await query.single();

      if (findError || !user) {
        // Log failed login attempt
        await this.logAction(null, 'FAILED_LOGIN', 'auth', null, {
          identifier,
          reason: 'User not found',
          ip_address: req.ip
        });

        return res.status(401).json({
          success: false,
          message: 'No account found with these credentials. Please register first.'
        });
      }

      // Check if account is locked
      if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        // Increment login attempts
        const loginAttempts = (user.login_attempts || 0) + 1;
        const lockAccount = loginAttempts >= 5;

        await supabase
          .from('users')
          .update({
            login_attempts: loginAttempts,
            account_locked_until: lockAccount ? new Date(Date.now() + 30 * 60 * 1000) : null // 30 minutes
          })
          .eq('id', user.id);

        // Log failed login
        await this.logAction(user.id, 'FAILED_LOGIN', 'auth', user.id, {
          reason: 'Invalid password',
          attempts: loginAttempts,
          locked: lockAccount,
          ip_address: req.ip
        });

        return res.status(401).json({
          success: false,
          message: lockAccount 
            ? 'Too many failed attempts. Account locked for 30 minutes.'
            : `Invalid password. ${5 - loginAttempts} attempts remaining.`
        });
      }

      // Reset login attempts on successful login
      await supabase
        .from('users')
        .update({
          login_attempts: 0,
          account_locked_until: null,
          last_login: new Date().toISOString()
        })
        .eq('id', user.id);

      // Generate token and create session
      const token = this.generateToken(user);
      await this.createSession(user.id, token, req);

      // Log successful login
      await this.logAction(user.id, 'LOGIN', 'auth', user.id, {
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      console.log('✅ User logged in successfully:', user.email);

      // Return success response
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
          role: user.role,
          status: user.status
        },
        token,
        redirect_to: this.getDashboardRoute(user.user_type)
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (userId && token) {
        // Deactivate session
        await supabase
          .from('sessions')
          .update({ is_active: false })
          .eq('user_id', userId)
          .eq('session_token', token);

        // Log logout
        await this.logAction(userId, 'LOGOUT', 'auth', userId, {
          ip_address: req.ip
        });
      }

      res.json({
        success: true,
        message: '👋 Logout successful'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Verify token
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if session is still active
      const { data: session } = await supabase
        .from('sessions')
        .select('is_active, expires_at')
        .eq('user_id', decoded.id)
        .eq('session_token', token)
        .single();

      if (!session || !session.is_active || new Date(session.expires_at) < new Date()) {
        return res.status(401).json({
          success: false,
          message: 'Session expired'
        });
      }

      // Get current user data
      const { data: user } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, phone_number, user_type, role, status')
        .eq('id', decoded.id)
        .eq('status', 'active')
        .single();

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
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
          role: user.role,
          status: user.status
        }
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }

  // Helper Methods
  validateRegistration(data) {
    const errors = [];
    const { firstName, lastName, email, phone, password, confirmPassword } = data;

    if (!firstName?.trim()) errors.push('First name is required');
    if (!lastName?.trim()) errors.push('Last name is required');
    
    if (!email?.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('Please enter a valid email address');
    }

    if (!phone?.trim()) {
      errors.push('Phone number is required');
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        errors.push('Please enter a valid 10-digit phone number');
      }
    }

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }

    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  }

  determineUserType({ role, employeeId, company, email }) {
    if (email.includes('admin') || role === 'admin') return 'admin';
    if (employeeId && email.includes('@capaciti.com')) return 'employee';
    if (role === 'it_specialist') return 'it_specialist';
    return 'visitor';
  }

  determineRole(userType) {
    const roleMap = {
      'admin': 'super_admin',
      'it_specialist': 'admin',
      'employee': 'user',
      'visitor': 'guest'
    };
    return roleMap[userType] || 'guest';
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        userType: user.user_type,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  async createSession(userId, token, req) {
    try {
      await supabase
        .from('sessions')
        .insert({
          user_id: userId,
          session_token: token,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          is_active: true
        });
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }

  async logAction(userId, action, resource, resourceId, details) {
    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action,
          resource,
          resource_id: resourceId,
          details,
          ip_address: details?.ip_address,
          user_agent: details?.user_agent
        });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  getDashboardRoute(userType) {
    const routes = {
      'admin': '/admin-dashboard',
      'it_specialist': '/admin-dashboard',
      'employee': '/employee-dashboard',
      'visitor': '/visitor-dashboard'
    };
    return routes[userType] || '/dashboard';
  }
}

module.exports = new AuthController();