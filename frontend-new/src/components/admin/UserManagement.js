import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Switch,
  Menu,
  Tooltip,
  Badge,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Fade,
  Slide,
  Zoom,
  Collapse,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as AddUserIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  Schedule as PendingIcon,
  Security as SecurityIcon,
  VpnKey as PermissionIcon,
  Group as GroupIcon,
  AdminPanelSettings as AdminIcon,
  Support as SupportIcon,
  Person as UserIcon,
  Business as CompanyIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  History as HistoryIcon,
  Report as ReportIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Success as SuccessIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Assignment as RoleIcon,
  Shield as ShieldIcon,
  Key as KeyIcon,
  Fingerprint as FingerprintIcon,
  DeviceHub as DeviceIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  AccountCircle as ProfileIcon,
  ContactMail as ContactIcon,
  Work as DepartmentIcon,
  Verified as VerifiedIcon,
  Stars as PremiumIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiMethods } from '../../api';
import { toast } from 'react-toastify';

// User roles with permissions
const USER_ROLES = {
  super_admin: {
    name: 'Super Administrator',
    color: 'error',
    icon: <AdminIcon />,
    permissions: ['*'],
    description: 'Full system access and control'
  },
  admin: {
    name: 'Administrator',
    color: 'warning',
    icon: <SecurityIcon />,
    permissions: ['user_management', 'system_settings', 'reports', 'analytics'],
    description: 'Administrative access to manage users and system'
  },
  support_lead: {
    name: 'Support Team Lead',
    color: 'primary',
    icon: <SupportIcon />,
    permissions: ['ticket_management', 'team_management', 'reports'],
    description: 'Manages support team and advanced ticket operations'
  },
  support_agent: {
    name: 'Support Agent',
    color: 'info',
    icon: <SupportIcon />,
    permissions: ['ticket_response', 'customer_contact'],
    description: 'Handles customer support tickets and inquiries'
  },
  user: {
    name: 'End User',
    color: 'success',
    icon: <UserIcon />,
    permissions: ['ticket_create', 'ticket_view_own'],
    description: 'Can create and view own tickets'
  },
  guest: {
    name: 'Guest User',
    color: 'default',
    icon: <PersonIcon />,
    permissions: ['ticket_create_limited'],
    description: 'Limited access for external users'
  }
};

// User status configurations
const USER_STATUS = {
  active: { label: 'Active', color: 'success', icon: <ActiveIcon /> },
  inactive: { label: 'Inactive', color: 'default', icon: <PendingIcon /> },
  suspended: { label: 'Suspended', color: 'error', icon: <BlockIcon /> },
  pending: { label: 'Pending Verification', color: 'warning', icon: <PendingIcon /> }
};

// Departments
const DEPARTMENTS = [
  { id: 'it', name: 'Information Technology', color: 'primary' },
  { id: 'support', name: 'Customer Support', color: 'info' },
  { id: 'sales', name: 'Sales & Marketing', color: 'success' },
  { id: 'hr', name: 'Human Resources', color: 'warning' },
  { id: 'finance', name: 'Finance & Accounting', color: 'error' },
  { id: 'operations', name: 'Operations', color: 'secondary' }
];

// Permission categories
const PERMISSION_CATEGORIES = {
  user_management: {
    name: 'User Management',
    permissions: [
      { id: 'user_create', name: 'Create Users', description: 'Add new users to the system' },
      { id: 'user_edit', name: 'Edit Users', description: 'Modify user information and settings' },
      { id: 'user_delete', name: 'Delete Users', description: 'Remove users from the system' },
      { id: 'user_view_all', name: 'View All Users', description: 'Access all user profiles and data' }
    ]
  },
  ticket_management: {
    name: 'Ticket Management',
    permissions: [
      { id: 'ticket_view_all', name: 'View All Tickets', description: 'Access all tickets in the system' },
      { id: 'ticket_assign', name: 'Assign Tickets', description: 'Assign tickets to agents or teams' },
      { id: 'ticket_priority', name: 'Change Priority', description: 'Modify ticket priority levels' },
      { id: 'ticket_close', name: 'Close Tickets', description: 'Mark tickets as resolved or closed' }
    ]
  },
  system_settings: {
    name: 'System Settings',
    permissions: [
      { id: 'system_config', name: 'System Configuration', description: 'Modify system-wide settings' },
      { id: 'security_settings', name: 'Security Settings', description: 'Configure security policies' },
      { id: 'integration_config', name: 'Integration Management', description: 'Manage third-party integrations' },
      { id: 'backup_restore', name: 'Backup & Restore', description: 'System backup and restoration operations' }
    ]
  },
  reports: {
    name: 'Reports & Analytics',
    permissions: [
      { id: 'reports_view', name: 'View Reports', description: 'Access system reports and analytics' },
      { id: 'reports_export', name: 'Export Reports', description: 'Export reports in various formats' },
      { id: 'analytics_advanced', name: 'Advanced Analytics', description: 'Access detailed analytics and insights' }
    ]
  }
};

// Styled components
const UserCard = styled(Card)(({ theme, status }) => ({
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.palette[USER_STATUS[status]?.color || 'primary'].main,
  }
}));

const PermissionChip = styled(Chip)(({ theme, granted }) => ({
  opacity: granted ? 1 : 0.5,
  backgroundColor: granted 
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.grey[500], 0.1),
  color: granted ? theme.palette.success.main : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: granted 
      ? alpha(theme.palette.success.main, 0.2)
      : alpha(theme.palette.grey[500], 0.2),
  }
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={true} timeout={500}>
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

const UserManagement = () => {
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  
  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Dialog states
  const [userDialog, setUserDialog] = useState({ open: false, mode: 'create', user: null });
  const [roleDialog, setRoleDialog] = useState({ open: false, mode: 'create', role: null });
  const [permissionDialog, setPermissionDialog] = useState({ open: false, user: null });
  const [bulkActionDialog, setBulkActionDialog] = useState({ open: false, action: null });
  const [importDialog, setImportDialog] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: 'user',
    status: 'active',
    password: '',
    confirmPassword: '',
    permissions: [],
    profileImage: null,
    sendWelcomeEmail: true,
    requirePasswordChange: true
  });
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [],
    color: 'primary',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        department: departmentFilter !== 'all' ? departmentFilter : undefined,
        sortBy,
        sortOrder
      };
      
      const [usersResponse, rolesResponse] = await Promise.all([
        apiMethods.admin.getUsers(params),
        apiMethods.admin.getRoles()
      ]);
      
      setUsers(usersResponse.data?.users || []);
      setRoles(rolesResponse.data?.roles || []);
      
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validation
      if (!userForm.firstName || !userForm.lastName || !userForm.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      if (userForm.password !== userForm.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      const userData = {
        ...userForm,
        name: `${userForm.firstName} ${userForm.lastName}`,
        permissions: userForm.permissions
      };
      
      await apiMethods.admin.createUser(userData);
      
      toast.success('User created successfully');
      setUserDialog({ open: false, mode: 'create', user: null });
      resetUserForm();
      loadData();
      
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const userData = {
        ...userForm,
        name: `${userForm.firstName} ${userForm.lastName}`
      };
      
      await apiMethods.admin.updateUser(userDialog.user.id, userData);
      
      toast.success('User updated successfully');
      setUserDialog({ open: false, mode: 'create', user: null });
      resetUserForm();
      loadData();
      
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiMethods.admin.deleteUser(userId);
        toast.success('User deleted successfully');
        loadData();
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleBulkAction = async () => {
    try {
      const action = bulkActionDialog.action;
      const userIds = selectedUsers;
      
      switch (action) {
        case 'activate':
          await apiMethods.admin.bulkUpdateUsers(userIds, { status: 'active' });
          toast.success(`${userIds.length} users activated`);
          break;
        case 'deactivate':
          await apiMethods.admin.bulkUpdateUsers(userIds, { status: 'inactive' });
          toast.success(`${userIds.length} users deactivated`);
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${userIds.length} users?`)) {
            await apiMethods.admin.bulkDeleteUsers(userIds);
            toast.success(`${userIds.length} users deleted`);
          }
          break;
        default:
          break;
      }
      
      setBulkActionDialog({ open: false, action: null });
      setSelectedUsers([]);
      loadData();
      
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Bulk action failed');
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const openUserDialog = (mode, user = null) => {
    if (user && mode === 'edit') {
      setUserForm({
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ')[1] || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        role: user.role || 'user',
        status: user.status || 'active',
        password: '',
        confirmPassword: '',
        permissions: user.permissions || [],
        profileImage: null,
        sendWelcomeEmail: false,
        requirePasswordChange: false
      });
    }
    setUserDialog({ open: true, mode, user });
  };

  const resetUserForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      role: 'user',
      status: 'active',
      password: '',
      confirmPassword: '',
      permissions: [],
      profileImage: null,
      sendWelcomeEmail: true,
      requirePasswordChange: true
    });
  };

  const exportUsers = async (format = 'csv') => {
    try {
      const response = await apiMethods.admin.exportUsers({
        format,
        filters: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          department: departmentFilter !== 'all' ? departmentFilter : undefined
        }
      });
      
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Users exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export users');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesRole && matchesDepartment;
    });
  }, [users, searchTerm, statusFilter, roleFilter, departmentFilter]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                <PeopleIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  User Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage users, roles, and permissions across your organization
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ImportIcon />}
                onClick={() => setImportDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                Import
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => exportUsers('csv')}
                sx={{ borderRadius: 2 }}
              >
                Export
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddUserIcon />}
                onClick={() => openUserDialog('create')}
                sx={{ borderRadius: 2 }}
              >
                Add User
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={currentTab}
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<PeopleIcon />} label="Users" iconPosition="start" />
            <Tab icon={<GroupIcon />} label="Roles & Permissions" iconPosition="start" />
            <Tab icon={<SecurityIcon />} label="Security & Access" iconPosition="start" />
            <Tab icon={<ReportIcon />} label="Activity & Audit" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Users Tab */}
        <TabPanel value={currentTab} index={0}>
          {/* Filters and Search */}
          <Box sx={{ p: 3, pb: 0 }}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    {Object.entries(USER_STATUS).map(([key, status]) => (
                      <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {status.icon}
                          {status.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    {Object.entries(USER_ROLES).map(([key, role]) => (
                      <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {role.icon}
                          {role.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh">
                    <IconButton onClick={loadData}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Filters">
                    <IconButton>
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
            
            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <Fade in={true}>
                <Alert
                  severity="info"
                  sx={{ mb: 3 }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        onClick={() => setBulkActionDialog({ open: true, action: 'activate' })}
                      >
                        Activate
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => setBulkActionDialog({ open: true, action: 'deactivate' })}
                      >
                        Deactivate
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => setBulkActionDialog({ open: true, action: 'delete' })}
                      >
                        Delete
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => setSelectedUsers([])}
                      >
                        Clear
                      </Button>
                    </Box>
                  }
                >
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                </Alert>
              </Fade>
            )}
          </Box>

          {/* Users Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                  <Zoom in={true} timeout={300} style={{ transitionDelay: `${index * 50}ms` }} key={user.id}>
                    <TableRow hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={user.profileImage}
                            sx={{ width: 40, height: 40 }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={USER_ROLES[user.role]?.icon}
                          label={USER_ROLES[user.role]?.name || user.role}
                          color={USER_ROLES[user.role]?.color || 'default'}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={DEPARTMENTS.find(d => d.id === user.department)?.name || user.department}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          icon={USER_STATUS[user.status]?.icon}
                          label={USER_STATUS[user.status]?.label || user.status}
                          color={USER_STATUS[user.status]?.color || 'default'}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton size="small" onClick={() => openUserDialog('edit', user)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manage Permissions">
                            <IconButton size="small" onClick={() => setPermissionDialog({ open: true, user })}>
                              <PermissionIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setSelectedUser(user);
                              }}
                            >
                              <MoreIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </Zoom>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TabPanel>

        {/* Roles & Permissions Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Roles Management */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      System Roles
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddUserIcon />}
                      onClick={() => setRoleDialog({ open: true, mode: 'create', role: null })}
                      size="small"
                    >
                      Add Role
                    </Button>
                  </Box>
                  
                  <List>
                    {Object.entries(USER_ROLES).map(([key, role]) => (
                      <ListItem key={key} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${role.color}.main` }}>
                            {role.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={role.name}
                          secondary={role.description}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => setRoleDialog({ open: true, mode: 'edit', role: { id: key, ...role } })}
                          >
                            <EditIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
              
              {/* Permission Categories */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Permission Categories
                  </Typography>
                  
                  {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                    <Accordion key={categoryKey} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {category.name}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {category.permissions.map((permission) => (
                            <ListItem key={permission.id}>
                              <ListItemText
                                primary={permission.name}
                                secondary={permission.description}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Security & Access Tab */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Security Settings */}
              <Grid item xs={12} md={8}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Security Configuration
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <LockIcon />
                            </Avatar>
                            <Typography variant="h6">Password Policy</Typography>
                          </Box>
                          <List dense>
                            <ListItem>
                              <FormControlLabel
                                control={<Switch defaultChecked />}
                                label="Require complex passwords"
                              />
                            </ListItem>
                            <ListItem>
                              <FormControlLabel
                                control={<Switch defaultChecked />}
                                label="Force password change every 90 days"
                              />
                            </ListItem>
                            <ListItem>
                              <FormControlLabel
                                control={<Switch />}
                                label="Enable two-factor authentication"
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                              <ShieldIcon />
                            </Avatar>
                            <Typography variant="h6">Access Control</Typography>
                          </Box>
                          <List dense>
                            <ListItem>
                              <FormControlLabel
                                control={<Switch defaultChecked />}
                                label="IP address restrictions"
                              />
                            </ListItem>
                            <ListItem>
                              <FormControlLabel
                                control={<Switch />}
                                label="Session timeout after 30 minutes"
                              />
                            </ListItem>
                            <ListItem>
                              <FormControlLabel
                                control={<Switch defaultChecked />}
                                label="Lock account after 5 failed attempts"
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              {/* Active Sessions */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Active Sessions
                  </Typography>
                  <List>
                    {[
                      { user: 'John Doe', device: 'Chrome/Windows', ip: '192.168.1.100', time: '2 min ago' },
                      { user: 'Jane Smith', device: 'Safari/MacOS', ip: '192.168.1.101', time: '15 min ago' },
                      { user: 'Mike Johnson', device: 'Firefox/Linux', ip: '192.168.1.102', time: '1 hour ago' }
                    ].map((session, index) => (
                      <ListItem key={index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <DeviceIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={session.user}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {session.device}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {session.ip} • {session.time}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Activity & Audit Tab */}
        <TabPanel value={currentTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Activity Summary */}
              <Grid item xs={12}>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <LoginIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h4" fontWeight="bold">
                              1,247
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Logins Today
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'warning.main' }}>
                            <ErrorIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h4" fontWeight="bold">
                              23
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Failed Login Attempts
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'success.main' }}>
                            <PeopleIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h4" fontWeight="bold">
                              89
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Active Users Now
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'info.main' }}>
                            <HistoryIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h4" fontWeight="bold">
                              156
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Actions This Hour
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Recent Activity Log */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ borderRadius: 2 }}>
                  <Box sx={{ p: 3, pb: 0 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Recent Activity
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Resource</TableCell>
                          <TableCell>IP Address</TableCell>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { user: 'John Doe', action: 'Login', resource: 'Dashboard', ip: '192.168.1.100', time: '2 min ago', status: 'success' },
                          { user: 'Jane Smith', action: 'Create User', resource: 'User Management', ip: '192.168.1.101', time: '5 min ago', status: 'success' },
                          { user: 'Unknown', action: 'Failed Login', resource: 'Login Page', ip: '10.0.0.1', time: '10 min ago', status: 'error' },
                          { user: 'Mike Johnson', action: 'Update Ticket', resource: 'Ticket #1234', ip: '192.168.1.102', time: '15 min ago', status: 'success' },
                          { user: 'Sarah Wilson', action: 'Export Data', resource: 'Analytics', ip: '192.168.1.103', time: '20 min ago', status: 'success' }
                        ].map((activity, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {activity.user.charAt(0)}
                                </Avatar>
                                {activity.user}
                              </Box>
                            </TableCell>
                            <TableCell>{activity.action}</TableCell>
                            <TableCell>{activity.resource}</TableCell>
                            <TableCell>{activity.ip}</TableCell>
                            <TableCell>{activity.time}</TableCell>
                            <TableCell>
                              <Chip
                                label={activity.status}
                                color={activity.status === 'success' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* User Dialog */}
      <Dialog
        open={userDialog.open}
        onClose={() => setUserDialog({ open: false, mode: 'create', user: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          {userDialog.mode === 'create' ? 'Create New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                value={userForm.firstName}
                onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                value={userForm.lastName}
                onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={userForm.phone}
                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={userForm.department}
                  label="Department"
                  onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  label="Role"
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  {Object.entries(USER_ROLES).map(([key, role]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {role.icon}
                        {role.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {userDialog.mode === 'create' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password *"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password *"
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={(e) => setUserForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userForm.sendWelcomeEmail}
                        onChange={(e) => setUserForm(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                      />
                    }
                    label="Send welcome email with login instructions"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userForm.requirePasswordChange}
                        onChange={(e) => setUserForm(prev => ({ ...prev, requirePasswordChange: e.target.checked }))}
                      />
                    }
                    label="Require password change on first login"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setUserDialog({ open: false, mode: 'create', user: null })}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={userDialog.mode === 'create' ? handleCreateUser : handleUpdateUser}
          >
            {userDialog.mode === 'create' ? 'Create User' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          console.log('Reset password for', selectedUser?.name);
          setAnchorEl(null);
        }}>
          <KeyIcon sx={{ mr: 1 }} />
          Reset Password
        </MenuItem>
        <MenuItem onClick={() => {
          console.log('Send activation email to', selectedUser?.email);
          setAnchorEl(null);
        }}>
          <EmailIcon sx={{ mr: 1 }} />
          Send Activation Email
        </MenuItem>
        <MenuItem onClick={() => {
          console.log('View login history for', selectedUser?.name);
          setAnchorEl(null);
        }}>
          <HistoryIcon sx={{ mr: 1 }} />
          Login History
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            handleDeleteUser(selectedUser?.id);
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog
        open={bulkActionDialog.open}
        onClose={() => setBulkActionDialog({ open: false, action: null })}
      >
        <DialogTitle>Confirm Bulk Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {bulkActionDialog.action} {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog({ open: false, action: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={bulkActionDialog.action === 'delete' ? 'error' : 'primary'}
            onClick={handleBulkAction}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;