import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Slide,
  useTheme,
  alpha,
  Fab,
  Badge,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  AppBar,
  Toolbar,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as TicketIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Build as InProgressIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as DownloadIcon,
  Chat as ChatIcon,
  Help as HelpIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  TrendingUp,
  Computer as HardwareIcon,
  Software as SoftwareIcon,
  Lock as PasswordIcon,
  Wifi as NetworkIcon,
  AccountCircle as AccountIcon,
  Support as SupportIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  AttachFile as AttachIcon,
  Priority as PriorityIcon,
  Business as DepartmentIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Message as MessageIcon,
  Group as TeamIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiMethods } from '../../api';
import { toast } from 'react-toastify';

// Enhanced ticket categories with employee-specific features
const TICKET_CATEGORIES = [
  { 
    value: 'hardware', 
    label: 'Hardware Issues', 
    icon: <HardwareIcon />, 
    color: '#FF6B35',
    description: 'Computers, printers, monitors, and hardware problems',
    departmentRelevant: ['IT', 'Operations', 'Finance']
  },
  { 
    value: 'software', 
    label: 'Software Problems', 
    icon: <SoftwareIcon />, 
    color: '#004E89',
    description: 'Application issues, installations, software bugs',
    departmentRelevant: ['Development', 'Marketing', 'Sales']
  },
  { 
    value: 'password', 
    label: 'Password Reset', 
    icon: <PasswordIcon />, 
    color: '#009639',
    description: 'Account access, password resets, security issues',
    departmentRelevant: ['All']
  },
  { 
    value: 'network', 
    label: 'Network/WiFi Issues', 
    icon: <NetworkIcon />, 
    color: '#7209B7',
    description: 'Connectivity, VPN, network performance issues',
    departmentRelevant: ['All']
  },
  { 
    value: 'account', 
    label: 'Account Management', 
    icon: <AccountIcon />, 
    color: '#FF1654',
    description: 'User permissions, access rights, account issues',
    departmentRelevant: ['HR', 'Administration']
  },
  { 
    value: 'general', 
    label: 'General IT Support', 
    icon: <SupportIcon />, 
    color: '#2F3061',
    description: 'Other IT-related support and consultations',
    departmentRelevant: ['All']
  }
];

// Enhanced priority levels for employees
const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low Priority', color: 'success', description: 'Can wait 2-3 days', sla: '72h' },
  { value: 'medium', label: 'Medium Priority', color: 'warning', description: 'Needs attention within 24h', sla: '24h' },
  { value: 'high', label: 'High Priority', color: 'error', description: 'Urgent - affects productivity', sla: '4h' },
  { value: 'critical', label: 'Critical', color: 'error', description: 'Business-critical issue', sla: '1h' }
];

// Department list
const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 
  'Customer Support', 'Product', 'Legal', 'Administration'
];

// Status configurations
const STATUS_CONFIG = {
  'submitted': { label: 'Submitted', color: 'info', icon: <TicketIcon /> },
  'under_review': { label: 'Under Review', color: 'warning', icon: <PendingIcon /> },
  'in_progress': { label: 'In Progress', color: 'primary', icon: <InProgressIcon /> },
  'resolved': { label: 'Resolved', color: 'success', icon: <CompletedIcon /> },
  'closed': { label: 'Closed', color: 'default', icon: <CloseIcon /> }
};

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={true} timeout={500}>
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        </Fade>
      )}
    </div>
  );
}

const EmployeeDashboard = () => {
  const theme = useTheme();
  const { userName, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  // Enhanced metrics for employees
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    criticalTickets: 0,
    avgResponseTime: '0h',
    departmentTickets: 0,
    lastTicketDate: null,
    satisfactionRating: 0
  });

  // Enhanced ticket form with employee features
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    department: user?.department || '',
    urgency: 'medium',
    attachments: [],
    affectedUsers: 1,
    businessImpact: ''
  });

  // Form validation
  const [errors, setErrors] = useState({});
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user's tickets and department tickets
      const [userTicketsRes, deptTicketsRes] = await Promise.all([
        apiMethods.tickets.getAll({ 
          userId: user.id, 
          sortBy: 'createdAt', 
          order: 'desc' 
        }),
        apiMethods.tickets.getAll({ 
          department: user.department, 
          limit: 10 
        })
      ]);
      
      const userTickets = userTicketsRes.data.tickets || [];
      const departmentTickets = deptTicketsRes.data.tickets || [];
      
      setTickets(userTickets);

      // Calculate enhanced metrics
      const totalTickets = userTickets.length;
      const openTickets = userTickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;
      const resolvedTickets = userTickets.filter(t => t.status === 'resolved').length;
      const criticalTickets = userTickets.filter(t => t.priority === 'critical').length;
      const lastTicket = userTickets[0];

      setMetrics({
        totalTickets,
        openTickets,
        resolvedTickets,
        criticalTickets,
        avgResponseTime: '1.8h', // Would come from API
        departmentTickets: departmentTickets.length,
        lastTicketDate: lastTicket ? lastTicket.createdAt : null,
        satisfactionRating: 4.2 // Would come from API
      });

    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      // Simulated notifications - in real app, would come from API
      setNotifications([
        {
          id: 1,
          type: 'info',
          message: 'Your ticket #TK-2024-001 has been updated',
          timestamp: new Date(),
          read: false
        },
        {
          id: 2,
          type: 'success',
          message: 'Ticket #TK-2024-002 has been resolved',
          timestamp: new Date(Date.now() - 3600000),
          read: false
        }
      ]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newTicket.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (newTicket.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!newTicket.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (newTicket.description.length < 30) {
      newErrors.description = 'Description must be at least 30 characters for employee tickets';
    }

    if (!newTicket.category) {
      newErrors.category = 'Please select a category';
    }

    if (!newTicket.department) {
      newErrors.department = 'Please select your department';
    }

    if (!newTicket.businessImpact.trim()) {
      newErrors.businessImpact = 'Please describe the business impact';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachmentFiles(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitTicket = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Upload attachments first if any
      let attachmentIds = [];
      if (attachmentFiles.length > 0) {
        const formData = new FormData();
        attachmentFiles.forEach(file => {
          formData.append('attachments', file);
        });

        const uploadResponse = await apiMethods.files.upload(formData);
        attachmentIds = uploadResponse.data.fileIds || [];
      }

      const ticketData = {
        ...newTicket,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        status: 'submitted',
        attachments: attachmentIds,
        createdAt: new Date().toISOString(),
        escalated: newTicket.priority === 'critical'
      };

      await apiMethods.tickets.create(ticketData);

      toast.success('🎉 Employee ticket submitted successfully! Priority routing enabled.', {
        position: "top-right",
        autoClose: 5000,
      });

      // Reset form
      setNewTicket({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        department: user?.department || '',
        urgency: 'medium',
        attachments: [],
        affectedUsers: 1,
        businessImpact: ''
      });
      setAttachmentFiles([]);
      setErrors({});
      setOpenSubmitDialog(false);

      // Reload data
      loadDashboardData();

    } catch (error) {
      console.error('Ticket submission failed:', error);
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const getPriorityInfo = (priority) => {
    return PRIORITY_LEVELS.find(p => p.value === priority) || PRIORITY_LEVELS[1];
  };

  const getCategoryInfo = (category) => {
    return TICKET_CATEGORIES.find(cat => cat.value === category) || TICKET_CATEGORIES[0];
  };

  const speedDialActions = [
    { icon: <AddIcon />, name: 'New Ticket', action: () => setOpenSubmitDialog(true) },
    { icon: <ChatIcon />, name: 'Live Chat', action: () => setChatOpen(true) },
    { icon: <RefreshIcon />, name: 'Refresh', action: loadDashboardData },
    { icon: <DownloadIcon />, name: 'Export', action: () => console.log('Export') }
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ textAlign: 'center', mt: 2 }}>
          Loading employee dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Enhanced Header */}
      <Fade in={true} timeout={600}>
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mr: 3, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                >
                  {userName?.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Welcome, {userName}! 👨‍💼
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Employee IT Support Dashboard
                  </Typography>
                  <Chip 
                    icon={<DepartmentIcon />}
                    label={`${user?.department || 'Unknown'} Department`}
                    sx={{ 
                      mt: 1, 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenSubmitDialog(true)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2
                  }}
                >
                  New Ticket
                </Button>
                <IconButton
                  sx={{ color: 'white' }}
                  onClick={() => setChatOpen(true)}
                >
                  <Badge badgeContent={2} color="error">
                    <ChatIcon />
                  </Badge>
                </IconButton>
                <IconButton
                  sx={{ color: 'white' }}
                >
                  <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                    <NotificationIcon />
                  </Badge>
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Enhanced Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4, px: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={400}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics.totalTickets}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      My Tickets
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      All time submissions
                    </Typography>
                  </Box>
                  <TicketIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={500}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics.openTickets}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Issues
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Avg Response: {metrics.avgResponseTime}
                    </Typography>
                  </Box>
                  <PendingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={600}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics.criticalTickets}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Critical Issues
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      High priority items
                    </Typography>
                  </Box>
                  <PriorityIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={700}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics.satisfactionRating}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Satisfaction
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Out of 5 stars ⭐
                    </Typography>
                  </Box>
                  <StarIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper elevation={2} sx={{ mx: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                minHeight: 48,
              }
            }}
          >
            <Tab icon={<DashboardIcon />} label="My Tickets" iconPosition="start" />
            <Tab icon={<TeamIcon />} label="Department" iconPosition="start" />
            <Tab icon={<ChatIcon />} label="Live Support" iconPosition="start" />
            <Tab icon={<NotificationIcon />} label="Notifications" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <TabPanel value={currentTab} index={0}>
          {/* Enhanced Search and Filter Section */}
          <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="under_review">Under Review</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={priorityFilter}
                    label="Priority"
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadDashboardData}
                  sx={{ borderRadius: 2, py: 1.8 }}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Enhanced Tickets Display */}
          <Grid container spacing={3}>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((ticket, index) => {
                const categoryInfo = getCategoryInfo(ticket.category);
                const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.submitted;
                const priorityInfo = getPriorityInfo(ticket.priority);

                return (
                  <Grid item xs={12} key={ticket.id}>
                    <Slide in={true} timeout={300 + index * 100}>
                      <Card 
                        elevation={3} 
                        sx={{ 
                          borderRadius: 3,
                          border: `2px solid ${alpha(categoryInfo.color, 0.3)}`,
                          '&:hover': { 
                            transform: 'translateY(-4px)',
                            boxShadow: theme.shadows[12],
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 4 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: categoryInfo.color, 
                                    mr: 2,
                                    width: 56,
                                    height: 56
                                  }}
                                >
                                  {categoryInfo.icon}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {ticket.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Chip 
                                      label={`#${ticket.ticketId || ticket.id}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontFamily: 'monospace' }}
                                    />
                                    <Chip 
                                      icon={categoryInfo.icon}
                                      label={categoryInfo.label}
                                      size="small"
                                      sx={{ bgcolor: alpha(categoryInfo.color, 0.1) }}
                                    />
                                    <Chip 
                                      icon={statusConfig.icon}
                                      label={statusConfig.label}
                                      size="small"
                                      color={statusConfig.color}
                                    />
                                    <Chip 
                                      label={priorityInfo.label}
                                      size="small"
                                      color={priorityInfo.color}
                                      variant="filled"
                                    />
                                    {ticket.department && (
                                      <Chip 
                                        icon={<DepartmentIcon />}
                                        label={ticket.department}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                              
                              <Typography 
                                variant="body1" 
                                color="text.secondary"
                                sx={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  mb: 2
                                }}
                              >
                                {ticket.description}
                              </Typography>

                              {ticket.attachments && ticket.attachments.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                  <AttachIcon fontSize="small" color="action" />
                                  <Typography variant="body2" color="text.secondary">
                                    {ticket.attachments.length} attachment(s)
                                  </Typography>
                                </Box>
                              )}
                            </Grid>

                            <Grid item xs={12} md={4}>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  SLA: {priorityInfo.sla}
                                </Typography>
                                
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                  <Tooltip title="View Details">
                                    <IconButton 
                                      onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                                      color="primary"
                                    >
                                      <ExpandMoreIcon sx={{ 
                                        transform: expandedTicket === ticket.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s'
                                      }} />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Edit Ticket">
                                    <IconButton color="primary">
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Start Chat">
                                    <IconButton color="success">
                                      <ChatIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Expanded Content with enhanced features */}
                          {expandedTicket === ticket.id && (
                            <Fade in={true} timeout={300}>
                              <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                                <Grid container spacing={3}>
                                  <Grid item xs={12} md={8}>
                                    <Typography variant="h6" gutterBottom>
                                      Complete Details
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                      {ticket.description}
                                    </Typography>
                                    
                                    {ticket.businessImpact && (
                                      <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                          Business Impact:
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          {ticket.businessImpact}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Grid>
                                  
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="h6" gutterBottom>
                                      Ticket Information
                                    </Typography>
                                    <List dense>
                                      <ListItem>
                                        <ListItemText 
                                          primary="Priority" 
                                          secondary={priorityInfo.label}
                                        />
                                      </ListItem>
                                      <ListItem>
                                        <ListItemText 
                                          primary="Department" 
                                          secondary={ticket.department || 'Not specified'}
                                        />
                                      </ListItem>
                                      <ListItem>
                                        <ListItemText 
                                          primary="Affected Users" 
                                          secondary={ticket.affectedUsers || 1}
                                        />
                                      </ListItem>
                                    </List>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Fade>
                          )}
                        </CardContent>
                      </Card>
                    </Slide>
                  </Grid>
                );
              })
            ) : (
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
                  <TicketIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    {tickets.length === 0 ? 'No tickets submitted yet' : 'No tickets match your criteria'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {tickets.length === 0 
                      ? 'Start by submitting your first IT support request.'
                      : 'Try adjusting your search or filter settings.'
                    }
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6">Department Tickets Overview</Typography>
          <Typography variant="body2" color="text.secondary">
            View tickets from your {user?.department} department colleagues...
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6">Live Support Chat</Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time chat with IT support team coming next...
          </Typography>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6">Notifications Center</Typography>
          <List>
            {notifications.map((notification, index) => (
              <ListItem key={notification.id} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${notification.type}.main` }}>
                    <NotificationIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message}
                  secondary={notification.timestamp.toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </TabPanel>
      </Paper>

      {/* Enhanced Submit Dialog with Employee Features */}
      <Dialog
        open={openSubmitDialog}
        onClose={() => setOpenSubmitDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            Submit Employee IT Request
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enhanced form with priority routing and department-specific features
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Request Title"
                placeholder="Clear, specific description of the issue..."
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title || 'Be descriptive - this helps with priority routing'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={newTicket.category}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                error={!!errors.category}
                helperText={errors.category}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {TICKET_CATEGORIES.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: category.color, width: 24, height: 24 }}>
                        {category.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {category.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {category.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Priority Level"
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {PRIORITY_LEVELS.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={priority.label} color={priority.color} size="small" />
                      <Box>
                        <Typography variant="body2">{priority.description}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          SLA: {priority.sla}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Department"
                value={newTicket.department}
                onChange={(e) => setNewTicket({ ...newTicket, department: e.target.value })}
                error={!!errors.department}
                helperText={errors.department}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Affected Users"
                value={newTicket.affectedUsers}
                onChange={(e) => setNewTicket({ ...newTicket, affectedUsers: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: 1000 }}
                helperText="How many users are affected by this issue?"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Detailed Description"
                placeholder="Provide comprehensive details including error messages, steps to reproduce, troubleshooting attempted, and impact on work..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description || `${newTicket.description.length}/1000 characters`}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Business Impact"
                placeholder="Describe how this issue affects your work, productivity, or business operations..."
                value={newTicket.businessImpact}
                onChange={(e) => setNewTicket({ ...newTicket, businessImpact: e.target.value })}
                error={!!errors.businessImpact}
                helperText={errors.businessImpact || 'Help us understand the urgency and impact'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* File Upload Section */}
            <Grid item xs={12}>
              <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}>
                <input
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="file-upload"
                  multiple
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 1 }}
                  >
                    Upload Attachments
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  Screenshots, error logs, documents (Max 10MB each)
                </Typography>
                
                {attachmentFiles.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {attachmentFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => removeAttachment(index)}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setOpenSubmitDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitTicket}
            disabled={submitting}
            startIcon={submitting ? <LinearProgress size={20} /> : <SendIcon />}
            sx={{ borderRadius: 2, minWidth: 140 }}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => setSpeedDialOpen(false)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.action();
              setSpeedDialOpen(false);
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default EmployeeDashboard;