import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateGmail = (email) => {
    return email.toLowerCase().endsWith('@gmail.com');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateGmail(formData.email)) {
      newErrors.email = 'Please use a Gmail address (@gmail.com)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Mock login - will connect to real API later
      console.log('Login attempt:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login with enhanced user data
      const mockUser = {
        id: 1,
        firstName: 'Mandlenkosi',
        lastName: 'Vundla',
        email: formData.email,
        userType: 'employee',
        department: 'Information Technology',
        deskNumber: 'D-205',
        officeNumber: 'Office 301',
        employeeId: 'EMP001',
        role: 'user',
        phoneNumber: '+27 123 456 7890'
      };

      // Store in localStorage
      localStorage.setItem('token', 'mock-jwt-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('userRole', mockUser.role);
      localStorage.setItem('userName', `${mockUser.firstName} ${mockUser.lastName}`);

      // Redirect based on user type
      if (mockUser.userType === 'it_specialist') {
        navigate('/it-dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      setErrors({ submit: 'Invalid email or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <form className="enhanced-auth-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>🎫 IT Support Login</h2>
            <p>Sign in to access your support tickets and dashboard</p>
          </div>

          {errors.submit && (
            <div className="error-alert">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Gmail Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="yourname@gmail.com"
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
            
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-btn primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              '🚀 Sign In'
            )}
          </button>

          <div className="divider">
            <span>New to our system?</span>
          </div>

          <Link to="/register" className="auth-btn secondary">
            ➕ Create New Account
          </Link>

          <div className="auth-footer">
            <p>Need help? Contact IT Support at <a href="mailto:support@company.com">support@company.com</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;