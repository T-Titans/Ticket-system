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
  StepContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Slide,
  useTheme,
  alpha,
  Fab,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
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
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  TrendingUp,
  Computer as HardwareIcon,
  Software as SoftwareIcon,
  Lock as PasswordIcon,
  Wifi as NetworkIcon,
  AccountCircle as AccountIcon,
  Support as SupportIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiMethods } from '../../api';
import { toast } from 'react-toastify';

// Ticket categories with icons and colors
const TICKET_CATEGORIES = [
  { 
    value: 'hardware', 
    label: 'Hardware Issues', 
    icon: <HardwareIcon />, 
    color: '#FF6B35',
    description: 'Computer, printer, monitor, and other hardware problems'
  },
  { 
    value: 'software', 
    label: 'Software Problems', 
    icon: <SoftwareIcon />, 
    color: '#004E89',
    description: 'Application crashes, installation issues, software bugs'
  },
  { 
    value: 'password', 
    label: 'Password Reset', 
    icon: <PasswordIcon />, 
    color: '#009639',
    description: 'Forgotten passwords, account lockouts, access issues'
  },
  { 
    value: 'network', 
    label: 'Network/WiFi Issues', 
    icon: <NetworkIcon />, 
    color: '#7209B7',
    description: 'Internet connectivity, WiFi problems, VPN issues'
  },
  { 
    value: 'account', 
    label: 'Account Lockouts', 
    icon: <AccountIcon />, 
    color: '#FF1654',
    description: 'User account access problems and permissions'
  },
  { 
    value: 'general', 
    label: 'General IT Support', 
    icon: <SupportIcon />, 
    color: '#2F3061',
    description: 'Other IT-related questions and support requests'
  }
];

// Status configurations
const STATUS_CONFIG = {
  'submitted': { label: 'Submitted', color: 'info', icon: <TicketIcon /> },
  'under_review': { label: 'Under Review', color: 'warning', icon: <PendingIcon /> },
  'in_progress': { label: 'In Progress', color: 'primary', icon: <InProgressIcon /> },
  'resolved': { label: 'Resolved', color: 'success', icon: <CompletedIcon /> },
  'closed': { label: 'Closed', color: 'default', icon: <CloseIcon /> }
};

const VisitorDashboard = () => {
  const theme = useTheme();
  const { userName, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState(null);

  // Dashboard metrics
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '0h',
    lastTicketDate: null
  });

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium'
  });

  // Form validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchTerm, statusFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiMethods.tickets.getAll({ 
        userId: user.id, 
        sortBy: 'createdAt', 
        order: 'desc' 
      });
      
      const userTickets = response.data.tickets || [];
      setTickets(userTickets);

      // Calculate metrics
      const totalTickets = userTickets.length;
      const openTickets = userTickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;
      const resolvedTickets = userTickets.filter(t => t.status === 'resolved').length;
      const lastTicket = userTickets[0];

      setMetrics({
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResponseTime: '2.5h', // This would come from API
        lastTicketDate: lastTicket ? lastTicket.createdAt : null
      });

    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load your tickets');
    } finally {
      setLoading(false);
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
    } else if (newTicket.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!newTicket.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTicket = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const ticketData = {
        ...newTicket,
        userId: user.id,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };

      await apiMethods.tickets.create(ticketData);

      toast.success('🎉 Ticket submitted successfully! You will receive updates via email.', {
        position: "top-right",
        autoClose: 5000,
      });

      // Reset form and close dialog
      setNewTicket({
        title: '',
        description: '',
        category: '',
        urgency: 'medium'
      });
      setErrors({});
      setOpenSubmitDialog(false);

      // Reload tickets
      loadDashboardData();

    } catch (error) {
      console.error('Ticket submission failed:', error);
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['submitted', 'under_review', 'in_progress', 'resolved'];
    return steps.indexOf(status);
  };

  const getCategoryInfo = (category) => {
    return TICKET_CATEGORIES.find(cat => cat.value === category) || TICKET_CATEGORIES[0];
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ textAlign: 'center', mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh', p: 3 }}>
      {/* Welcome Header */}
      <Fade in={true} timeout={600}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            borderRadius: 3
          }}
        >
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Welcome, {userName}! 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                Visitor Support Dashboard
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                Submit IT support requests and track their progress in real-time.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 2, md: 0 } }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setOpenSubmitDialog(true)}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5
                }}
              >
                Submit New Ticket
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={400}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: 'white',
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics.totalTickets}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Tickets
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
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics.openTickets}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Open Tickets
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
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white',
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics.resolvedTickets}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Resolved
                    </Typography>
                  </Box>
                  <CompletedIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={700}>
            <Card sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {metrics.avgResponseTime}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Avg Response
                    </Typography>
                  </Box>
                  <SpeedIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search tickets by title, description, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="under_review">Under Review</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
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

      {/* Tickets List */}
      <Grid container spacing={3}>
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket, index) => {
            const categoryInfo = getCategoryInfo(ticket.category);
            const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.submitted;

            return (
              <Grid item xs={12} key={ticket.id}>
                <Slide in={true} timeout={300 + index * 100}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      borderRadius: 2,
                      border: `2px solid ${alpha(categoryInfo.color, 0.2)}`,
                      '&:hover': { 
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: categoryInfo.color, 
                                mr: 2,
                                width: 48,
                                height: 48
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
                              </Box>
                            </Box>
                          </Box>
                          
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 2
                            }}
                          >
                            {ticket.description}
                          </Typography>

                          {/* Progress Stepper */}
                          <Box sx={{ mt: 2 }}>
                            <Stepper activeStep={getStatusStep(ticket.status)} alternativeLabel>
                              <Step>
                                <StepLabel>Submitted</StepLabel>
                              </Step>
                              <Step>
                                <StepLabel>Under Review</StepLabel>
                              </Step>
                              <Step>
                                <StepLabel>In Progress</StepLabel>
                              </Step>
                              <Step>
                                <StepLabel>Resolved</StepLabel>
                              </Step>
                            </Stepper>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Created: {new Date(ticket.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Last Updated: {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
                            </Typography>
                            
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Expanded Content */}
                      {expandedTicket === ticket.id && (
                        <Fade in={true} timeout={300}>
                          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" gutterBottom>
                              Full Description
                            </Typography>
                            <Typography variant="body2" paragraph>
                              {ticket.description}
                            </Typography>
                            
                            {ticket.comments && ticket.comments.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                  Updates & Comments
                                </Typography>
                                {ticket.comments.map((comment, idx) => (
                                  <Paper key={idx} elevation={1} sx={{ p: 2, mb: 1, bgcolor: 'background.default' }}>
                                    <Typography variant="body2" gutterBottom>
                                      {comment.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {comment.author} - {new Date(comment.createdAt).toLocaleString()}
                                    </Typography>
                                  </Paper>
                                ))}
                              </Box>
                            )}
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
            <Paper elevation={1} sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
              <TicketIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {tickets.length === 0 ? 'No tickets yet' : 'No tickets match your search'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {tickets.length === 0 
                  ? 'Submit your first IT support request to get started.'
                  : 'Try adjusting your search criteria or filters.'
                }
              </Typography>
              {tickets.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenSubmitDialog(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Submit Your First Ticket
                </Button>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="submit ticket"
        onClick={() => setOpenSubmitDialog(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000
        }}
      >
        <AddIcon />
      </Fab>

      {/* Submit Ticket Dialog */}
      <Dialog
        open={openSubmitDialog}
        onClose={() => setOpenSubmitDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            Submit New IT Support Ticket
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Provide detailed information to help us resolve your issue quickly
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ticket Title"
                placeholder="Brief description of your issue..."
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title || 'Be specific and descriptive (min 10 characters)'}
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
                helperText={errors.category || 'Select the most relevant category'}
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
                label="Urgency Level"
                value={newTicket.urgency}
                onChange={(e) => setNewTicket({ ...newTicket, urgency: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="low">
                  <Chip label="Low" color="success" size="small" sx={{ mr: 1 }} />
                  Can wait a few days
                </MenuItem>
                <MenuItem value="medium">
                  <Chip label="Medium" color="warning" size="small" sx={{ mr: 1 }} />
                  Needs attention within 24 hours
                </MenuItem>
                <MenuItem value="high">
                  <Chip label="High" color="error" size="small" sx={{ mr: 1 }} />
                  Urgent - affects my work
                </MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Detailed Description"
                placeholder="Provide a detailed description of your issue, including steps to reproduce, error messages, and any troubleshooting you've already tried..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description || `${newTicket.description.length}/500 characters (min 20 required)`}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
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
            sx={{ borderRadius: 2, minWidth: 120 }}
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisitorDashboard;