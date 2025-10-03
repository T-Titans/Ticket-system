import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCapacitiTheme } from '../contexts/CapacitiThemeContext';
import './ModernLogin.css';

export default function ModernLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "employee"
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useCapacitiTheme();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!isLogin) {
      if (!formData.firstName.trim()) errors.firstName = 'First name required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name required';
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Please enter a valid 10-digit phone number';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'Email required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getRoleDashboard = (role) => {
    const dashboards = {
      admin: '/admin-dashboard',
      employee: '/employee-dashboard',
      visitor: '/visitor-dashboard'
    };
    return dashboards[role] || '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        position: "top-center",
        autoClose: 3000
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email.trim(), formData.password);
        const userRole = result.user?.role || 'employee';
        
        toast.success(`Welcome back, ${result.user?.first_name || 'User'}! `, {
          position: "top-center",
          autoClose: 2000
        });
        
        setTimeout(() => {
          navigate(getRoleDashboard(userRole));
        }, 1000);
      } else {
        const registrationData = {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone_number: formData.phone.replace(/\D/g, ''),
          role: formData.role
        };

        console.log('Sending registration data:', registrationData);

        await register(registrationData);

        toast.success(' Registration successful! Please login to continue.', {
          position: "top-center",
          autoClose: 3000
        });
        
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            ...formData,
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            phone: ''
          });
        }, 1500);
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error(error.message || "Authentication failed. Please try again.", {
        position: "top-center",
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modern-auth-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="leopard-overlay"></div>
      
      <button 
        className="theme-toggle-btn"
        onClick={toggleDarkMode}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? '' : ''}
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-container">
            <span className="logo-icon"></span>
          </div>
          <h1 className="auth-title">
            {isLogin ? 'Welcome Back!' : 'Join Capaciti'}
          </h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to manage your tickets' : 'Create your account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className={formErrors.firstName ? 'error' : ''}
                  />
                  {formErrors.firstName && (
                    <span className="error-text">{formErrors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className={formErrors.lastName ? 'error' : ''}
                  />
                  {formErrors.lastName && (
                    <span className="error-text">{formErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0812345678"
                  className={formErrors.phone ? 'error' : ''}
                />
                {formErrors.phone && (
                  <span className="error-text">{formErrors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label>I am a...</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="role-select"
                >
                  <option value="employee"> Employee</option>
                  <option value="visitor"> Visitor</option>
                  <option value="admin"> Admin</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && (
              <span className="error-text">{formErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder=""
                className={formErrors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '' : ''}
              </button>
            </div>
            {formErrors.password && (
              <span className="error-text">{formErrors.password}</span>
            )}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder=""
                  className={formErrors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '' : ''}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <span className="error-text">{formErrors.confirmPassword}</span>
              )}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? '' : ''}</span>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormErrors({});
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  phone: "",
                  role: "employee"
                });
              }}
              className="switch-btn"
            >
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
