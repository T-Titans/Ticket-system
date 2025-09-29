import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const departments = [
  'Information Technology',
  'Human Resources',
  'Finance',
  'Marketing',
  'Operations',
  'Sales',
  'Customer Service',
  'Research & Development',
  'Legal',
  'Administration'
];

const userTypes = [
  { value: 'employee', label: 'Employee' },
  { value: 'it_specialist', label: 'IT Specialist' },
  { value: 'visitor', label: 'Visitor' }
];

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'employee',
    department: '',
    deskNumber: '',
    officeNumber: '',
    phoneNumber: '',
    employeeId: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateGmail = (email) => {
    return email.toLowerCase().endsWith('@gmail.com');
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    if (!formData.department && formData.userType !== 'visitor') newErrors.department = 'Department is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';

    // Email validation
    if (formData.email && !validateGmail(formData.email)) {
      newErrors.email = 'Please use a Gmail address (@gmail.com)';
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Employee ID for non-visitors
    if (formData.userType !== 'visitor' && !formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      // Mock registration - will connect to real API later
      console.log('Registration data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success response
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
      
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <form className="enhanced-auth-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>🎫 Register for IT Support</h2>
            <p>Create your account to submit and track IT tickets</p>
          </div>

          {errors.submit && (
            <div className="error-alert">
              {errors.submit}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
                placeholder="Enter your first name"
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
                placeholder="Enter your last name"
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Gmail Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="yourname@gmail.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Min 6 characters"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="userType">User Type *</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="select-input"
            >
              {userTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {formData.userType !== 'visitor' && (
            <div className="form-group">
              <label htmlFor="employeeId">Employee ID *</label>
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className={errors.employeeId ? 'error' : ''}
                placeholder="EMP001"
              />
              {errors.employeeId && <span className="error-text">{errors.employeeId}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`select-input ${errors.department ? 'error' : ''}`}
              disabled={formData.userType === 'visitor'}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && <span className="error-text">{errors.department}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="deskNumber">Desk Number</label>
              <input
                type="text"
                id="deskNumber"
                name="deskNumber"
                value={formData.deskNumber}
                onChange={handleChange}
                placeholder="D-101"
              />
            </div>

            <div className="form-group">
              <label htmlFor="officeNumber">Office Number</label>
              <input
                type="text"
                id="officeNumber"
                name="officeNumber"
                value={formData.officeNumber}
                onChange={handleChange}
                placeholder="Office 205"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? 'error' : ''}
              placeholder="+27 123 456 7890"
            />
            {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
          </div>

          <button type="submit" className="auth-btn primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              '✨ Create Account'
            )}
          </button>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;