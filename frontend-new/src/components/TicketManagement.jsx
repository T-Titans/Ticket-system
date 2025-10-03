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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  Badge,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Slide,
  Zoom,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ResolveIcon,
  Close as CloseIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  AttachFile as AttachIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Speed as PriorityIcon,
  Person as UserIcon,
  Business as DepartmentIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircleOutline as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  BulkActions as BulkIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiMethods } from '../../api';
import { toast } from 'react-toastify';

// Enhanced status configurations with workflow
const STATUS_WORKFLOW = {
  'submitted': {
    label: 'Submitted',
    color: 'info',
    icon: <AssignIcon />,
    nextStates: ['under_review', 'in_progress'],
    description: 'New ticket awaiting review'
  },
  'under_review': {
    label: 'Under Review',
    color: 'warning',
    icon: <ScheduleIcon />,
    nextStates: ['in_progress', 'resolved', 'closed'],
    description: 'Being evaluated by IT team'
  },
  'in_progress': {
    label: 'In Progress',
    color: 'primary',
    icon: <EditIcon />,
    nextStates: ['resolved', 'under_review'],
    description: 'Actively being worked on'
  },
  'resolved': {
    label: 'Resolved',
    color: 'success',
    icon: <ResolveIcon />,
    nextStates: ['closed', 'in_progress'],
    description: 'Solution provided, awaiting confirmation'
  },
  'closed': {
    label: 'Closed',
    color: 'default',
    icon: <CloseIcon />,
    nextStates: ['in_progress'],
    description: 'Ticket completed and closed'
  }
};

// Priority configurations with escalation rules
const PRIORITY_CONFIG = {
  'low': {
    label: 'Low',
    color: 'success',
    icon: <InfoIcon />,
    sla: '72h',
    escalationHours: 72,
    description: 'Non-urgent, can wait'
  },
  'medium': {
    label: 'Medium',
    color: 'warning',
    icon: <WarningIcon />,
    sla: '24h',
    escalationHours: 24,
    description: 'Standard priority'
  },
  'high': {
    label: 'High',
    color: 'error',
    icon: <ErrorIcon />,
    sla: '4h',
    escalationHours: 4,
    description: 'Urgent attention required'
  },
  'critical': {
    label: 'Critical',
    color: 'error',
    icon: <FlagIcon />,
    sla: '1h',
    escalationHours: 1,
    description: 'Business-critical issue'
  }
};

// Bulk action configurations
const BULK_ACTIONS = [
  { id: 'assign', label: 'Assign to Agent', icon: <AssignIcon /> },
  { id: 'change_status', label: 'Change Status', icon: <EditIcon /> },
  { id: 'set_priority', label: 'Set Priority', icon: <PriorityIcon /> },
  { id: 'add_comment', label: 'Add Bulk Comment', icon: <CommentIcon /> },
  { id: 'export', label: 'Export Selected', icon: <ExportIcon /> },
  { id: 'delete', label: 'Delete Tickets', icon: <DeleteIcon /> }
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ticket-tabpanel-${index}`}
      aria-labelledby={`ticket-tab-${index}`}
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

const TicketManagement = () => {
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  
  // Main state
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    department: 'all',
    dateRange: 'all',
    escalated: false
  });
  
  // Dialog states
  const [viewTicketDialog, setViewTicketDialog] = useState(false);
  const [editTicketDialog, setEditTicketDialog] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [commentDialog, setCommentDialog] = useState(false);
  
  // Current ticket and actions
  const [currentTicket, setCurrentTicket] = useState(null);
  const [selectedBulkAction, setSelectedBulkAction] = useState('');
  const [newComment, setNewComment] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuTicketId, setMenuTicketId] = useState(null);
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalTickets: 0,
    openTickets: 0,
    overdueTickets: 0,
    avgResolutionTime: '0h',
    satisfactionScore: 0,
    ticketsByStatus: {},
    ticketsByPriority: {},
    recentActivity: []
  });

  useEffect(() => {
    loadTickets();
    loadAnalytics();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await apiMethods.tickets.getAll({
        page: page + 1,
        limit: rowsPerPage,
        sortBy: orderBy,
        order: order,
        includeDetails: true
      });
      
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await apiMethods.analytics.getDashboard();
      setAnalytics(response.data || analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = tickets;

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.title?.toLowerCase().includes(searchTerm) ||
        ticket.description?.toLowerCase().includes(searchTerm) ||
        ticket.ticketId?.toLowerCase().includes(searchTerm) ||
        ticket.userName?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    // Department filter
    if (filters.department !== 'all') {
      filtered = filtered.filter(ticket => ticket.department === filters.department);
    }

    // Escalated filter
    if (filters.escalated) {
      filtered = filtered.filter(ticket => ticket.escalated || isTicketOverdue(ticket));
    }

    setFilteredTickets(filtered);
  };

  const isTicketOverdue = (ticket) => {
    if (!ticket.createdAt || ticket.status === 'closed') return false;
    
    const created = new Date(ticket.createdAt);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
    
    return hoursDiff > priority.escalationHours;
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredTickets.map((ticket) => ticket.id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleTicketSelect = (ticketId) => {
    const selectedIndex = selected.indexOf(ticketId);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, ticketId];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await apiMethods.tickets.updateStatus(ticketId, newStatus);
      
      // Add activity log
      await apiMethods.tickets.addComment(ticketId, {
        comment: `Status changed to ${STATUS_WORKFLOW[newStatus].label}`,
        type: 'system',
        reason: statusChangeReason
      });

      toast.success('Ticket status updated successfully');
      loadTickets();
      setAnchorEl(null);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleBulkAction = async () => {
    if (selected.length === 0) {
      toast.warning('Please select tickets first');
      return;
    }

    try {
      const bulkData = {
        ticketIds: selected,
        action: selectedBulkAction,
        data: {} // This would contain action-specific data
      };

      await apiMethods.tickets.bulkUpdate(selected, bulkData);
      
      toast.success(`Bulk action applied to ${selected.length} tickets`);
      setSelected([]);
      setBulkActionDialog(false);
      loadTickets();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Failed to apply bulk action');
    }
  };

  const handleAddComment = async () => {
    if (!currentTicket || !newComment.trim()) return;

    try {
      await apiMethods.tickets.addComment(currentTicket.id, {
        comment: newComment,
        author: user.name,
        type: 'admin'
      });

      toast.success('Comment added successfully');
      setNewComment('');
      setCommentDialog(false);
      loadTickets();
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeSince = (dateString) => {
    const diff = new Date() - new Date(dateString);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getPriorityChip = (priority) => {
    const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
      />
    );
  };

  const getStatusChip = (status) => {
    const config = STATUS_WORKFLOW[status] || STATUS_WORKFLOW.submitted;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ textAlign: 'center', mt: 2 }}>
          Loading ticket management system...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Analytics */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Advanced Ticket Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enterprise-level ticket management with automation and analytics
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadTickets}
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<ExportIcon />}
                sx={{ borderRadius: 2 }}
              >
                Export All
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {analytics.totalTickets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                  {analytics.openTickets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Open Tickets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {analytics.overdueTickets}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overdue
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {analytics.avgResolutionTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Resolution
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Advanced Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Status</MenuItem>
                {Object.entries(STATUS_WORKFLOW).map(([key, config]) => (
                  <MenuItem key={key} value={key}>{config.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Priority</MenuItem>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>{config.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                label="Department"
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.escalated}
                  onChange={(e) => setFilters({ ...filters, escalated: e.target.checked })}
                />
              }
              label="Escalated Only"
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {selected.length > 0 && (
                <Tooltip title="Bulk Actions">
                  <IconButton
                    color="primary"
                    onClick={() => setBulkActionDialog(true)}
                  >
                    <Badge badgeContent={selected.length} color="error">
                      <BulkIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Enhanced Data Table */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < filteredTickets.length}
                    checked={filteredTickets.length > 0 && selected.length === filteredTickets.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'ticketId'}
                    direction={orderBy === 'ticketId' ? order : 'asc'}
                    onClick={() => handleSort('ticketId')}
                  >
                    Ticket ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'title'}
                    direction={orderBy === 'title' ? order : 'asc'}
                    onClick={() => handleSort('title')}
                  >
                    Title & User
                  </TableSortLabel>
                </TableCell>
                <TableCell>Category</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'priority'}
                    direction={orderBy === 'priority' ? order : 'asc'}
                    onClick={() => handleSort('priority')}
                  >
                    Priority
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'createdAt'}
                    direction={orderBy === 'createdAt' ? order : 'asc'}
                    onClick={() => handleSort('createdAt')}
                  >
                    Created
                  </TableSortLabel>
                </TableCell>
                <TableCell>SLA</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((ticket) => {
                  const isSelected = selected.indexOf(ticket.id) !== -1;
                  const isOverdue = isTicketOverdue(ticket);
                  const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;

                  return (
                    <TableRow
                      key={ticket.id}
                      hover
                      selected={isSelected}
                      sx={{
                        bgcolor: isOverdue ? alpha(theme.palette.error.main, 0.05) : 'inherit',
                        '&:hover': {
                          bgcolor: isOverdue 
                            ? alpha(theme.palette.error.main, 0.1) 
                            : alpha(theme.palette.action.hover, 0.04)
                        }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleTicketSelect(ticket.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                            #{ticket.ticketId || ticket.id}
                          </Typography>
                          {isOverdue && (
                            <Chip
                              label="OVERDUE"
                              color="error"
                              size="small"
                              variant="filled"
                              sx={{ mt: 0.5, fontSize: '0.6rem', height: 16 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold" noWrap>
                            {ticket.title}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: '0.7rem' }}>
                              {ticket.userName?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                              {ticket.userName}
                            </Typography>
                          </Box>
                          {ticket.department && (
                            <Chip
                              icon={<DepartmentIcon />}
                              label={ticket.department}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5, height: 18, fontSize: '0.6rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.category}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>{getPriorityChip(ticket.priority)}</TableCell>
                      <TableCell>{getStatusChip(ticket.status)}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatDate(ticket.createdAt)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getTimeSince(ticket.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={isOverdue ? 100 : 60} // This would be calculated based on SLA
                            color={isOverdue ? 'error' : 'primary'}
                            sx={{ width: 60, height: 4, borderRadius: 2 }}
                          />
                          <Typography variant="caption" color={isOverdue ? 'error' : 'text.secondary'}>
                            {priority.sla}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setCurrentTicket(ticket);
                                setViewTicketDialog(true);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Add Comment">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setCurrentTicket(ticket);
                                setCommentDialog(true);
                              }}
                            >
                              <CommentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setMenuTicketId(ticket.id);
                              }}
                            >
                              <MoreIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredTickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuList dense>
          <MenuItem onClick={() => {
            // Handle edit
            setAnchorEl(null);
          }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit Ticket</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            // Handle assign
            setAnchorEl(null);
          }}>
            <ListItemIcon><AssignIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Assign to Agent</ListItemText>
          </MenuItem>
          <Divider />
          {menuTicketId && tickets.find(t => t.id === menuTicketId) && 
            Object.entries(STATUS_WORKFLOW).map(([status, config]) => (
              <MenuItem 
                key={status}
                onClick={() => handleStatusChange(menuTicketId, status)}
              >
                <ListItemIcon>{config.icon}</ListItemIcon>
                <ListItemText>Mark as {config.label}</ListItemText>
              </MenuItem>
            ))
          }
          <Divider />
          <MenuItem onClick={() => {
            // Handle delete
            setAnchorEl(null);
          }}>
            <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Delete Ticket</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      {/* View Ticket Dialog */}
      <Dialog
        open={viewTicketDialog}
        onClose={() => setViewTicketDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight="bold">
              Ticket Details - #{currentTicket?.ticketId || currentTicket?.id}
            </Typography>
            <IconButton onClick={() => setViewTicketDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentTicket && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {currentTicket.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {currentTicket.description}
                  </Typography>
                </Box>

                {/* Activity Timeline */}
                <Typography variant="h6" gutterBottom>
                  Activity Timeline
                </Typography>
                <Timeline>
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="primary">
                        <AssignIcon />
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" fontWeight="bold">
                        Ticket Created
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(currentTicket.createdAt)}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                  {/* More timeline items would be dynamically generated */}
                </Timeline>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Ticket Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Status:</Typography>
                      {getStatusChip(currentTicket.status)}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Priority:</Typography>
                      {getPriorityChip(currentTicket.priority)}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Category:</Typography>
                      <Typography variant="body2">{currentTicket.category}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Department:</Typography>
                      <Typography variant="body2">{currentTicket.department}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Requester:</Typography>
                      <Typography variant="body2">{currentTicket.userName}</Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Quick Actions */}
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CommentIcon />}
                      onClick={() => {
                        setViewTicketDialog(false);
                        setCommentDialog(true);
                      }}
                    >
                      Add Comment
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AssignIcon />}
                    >
                      Assign to Agent
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ResolveIcon />}
                      color="success"
                      onClick={() => handleStatusChange(currentTicket.id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialog}
        onClose={() => setCommentDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          Add Comment to Ticket #{currentTicket?.ticketId || currentTicket?.id}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comment"
            placeholder="Add your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddComment}
            startIcon={<SendIcon />}
            disabled={!newComment.trim()}
          >
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkActionDialog}
        onClose={() => setBulkActionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          Bulk Actions ({selected.length} tickets selected)
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Action</InputLabel>
            <Select
              value={selectedBulkAction}
              label="Select Action"
              onChange={(e) => setSelectedBulkAction(e.target.value)}
            >
              {BULK_ACTIONS.map((action) => (
                <MenuItem key={action.id} value={action.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {action.icon}
                    {action.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBulkAction}
            disabled={!selectedBulkAction}
          >
            Apply Action
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketManagement;