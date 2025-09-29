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
  DatePicker,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuList,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  People as PeopleIcon,
  Assignment as TicketsIcon,
  CheckCircle as ResolvedIcon,
  Schedule as PendingIcon,
  Star as RatingIcon,
  Download as ExportIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  DateRange as DateIcon,
  Insights as InsightsIcon,
  Dashboard as DashboardIcon,
  BarChart as ChartIcon,
  DonutLarge as DonutIcon,
  Timeline as TimelineIcon,
  Assessment as ReportIcon,
  Warning as AlertIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircleOutline as SuccessIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  StackedBarChart as StackedChartIcon,
  AutoGraph as AutoChartIcon,
  Gamepad2 as InteractiveIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  Treemap,
  Funnel,
  FunnelChart
} from 'recharts';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { apiMethods } from '../../api';
import { toast } from 'react-toastify';

// Chart color schemes
const CHART_COLORS = {
  primary: ['#1976d2', '#42a5f5', '#90caf9', '#bbdefb', '#e3f2fd'],
  success: ['#2e7d32', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'],
  warning: ['#ed6c02', '#ff9800', '#ffb74d', '#ffcc80', '#ffe0b2'],
  error: ['#d32f2f', '#f44336', '#e57373', '#ef9a9a', '#ffcdd2'],
  purple: ['#7b1fa2', '#9c27b0', '#ba68c8', '#ce93d8', '#e1bee7'],
  teal: ['#00695c', '#00897b', '#26a69a', '#4db6ac', '#80cbc4']
};

// Time range presets
const TIME_RANGES = [
  { id: 'today', label: 'Today', days: 0 },
  { id: 'week', label: 'Last 7 Days', days: 7 },
  { id: 'month', label: 'Last 30 Days', days: 30 },
  { id: 'quarter', label: 'Last 90 Days', days: 90 },
  { id: 'year', label: 'Last Year', days: 365 },
  { id: 'custom', label: 'Custom Range', days: null }
];

// Chart type options
const CHART_TYPES = [
  { id: 'line', label: 'Line Chart', icon: <LineChartIcon /> },
  { id: 'area', label: 'Area Chart', icon: <ShowChart /> },
  { id: 'bar', label: 'Bar Chart', icon: <ChartIcon /> },
  { id: 'pie', label: 'Pie Chart', icon: <PieChartIcon /> },
  { id: 'donut', label: 'Donut Chart', icon: <DonutIcon /> },
  { id: 'composed', label: 'Combined Chart', icon: <StackedChartIcon /> }
];

// Metric definitions
const METRIC_DEFINITIONS = {
  totalTickets: { label: 'Total Tickets', icon: <TicketsIcon />, color: 'primary' },
  resolvedTickets: { label: 'Resolved Tickets', icon: <ResolvedIcon />, color: 'success' },
  avgResolutionTime: { label: 'Avg Resolution Time', icon: <TimerIcon />, color: 'warning' },
  customerSatisfaction: { label: 'Customer Satisfaction', icon: <RatingIcon />, color: 'success' },
  activeAgents: { label: 'Active Agents', icon: <PeopleIcon />, color: 'primary' },
  responseTime: { label: 'Avg Response Time', icon: <SpeedIcon />, color: 'info' }
};

// Styled components
const MetricCard = styled(Card)(({ theme, color }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    backgroundColor: theme.palette[color || 'primary'].main,
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  '& .recharts-wrapper': {
    '& .recharts-cartesian-axis-tick-value': {
      fontSize: '12px',
      fill: theme.palette.text.secondary,
    },
    '& .recharts-legend-wrapper': {
      paddingTop: theme.spacing(2),
    }
  }
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
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

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter state
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'days'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedDepartments, setSelectedDepartments] = useState(['all']);
  const [selectedAgents, setSelectedAgents] = useState(['all']);
  const [chartType, setChartType] = useState('line');
  
  // Data state
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalTickets: 0,
      resolvedTickets: 0,
      avgResolutionTime: '0h',
      customerSatisfaction: 0,
      activeAgents: 0,
      responseTime: '0h'
    },
    trends: [],
    categoryBreakdown: [],
    priorityDistribution: [],
    agentPerformance: [],
    timeAnalysis: [],
    satisfactionTrends: [],
    workloadDistribution: []
  });
  
  const [realtimeData, setRealtimeData] = useState({
    ticketsPerHour: [],
    activeUsers: 0,
    systemLoad: 0
  });
  
  // UI state
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    trends: true,
    breakdown: true,
    performance: false
  });
  
  const [filters, setFilters] = useState({
    showPredictions: true,
    showComparison: true,
    realTimeUpdates: true,
    showTrendlines: true
  });

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      if (filters.realTimeUpdates) {
        updateRealtimeData();
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [dateRange, startDate, endDate, selectedDepartments, selectedAgents]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        departments: selectedDepartments.includes('all') ? [] : selectedDepartments,
        agents: selectedAgents.includes('all') ? [] : selectedAgents
      };
      
      const [
        overviewRes,
        trendsRes,
        categoryRes,
        priorityRes,
        agentRes,
        timeRes,
        satisfactionRes
      ] = await Promise.all([
        apiMethods.analytics.getOverview(params),
        apiMethods.analytics.getTrends(params),
        apiMethods.analytics.getCategoryBreakdown(params),
        apiMethods.analytics.getPriorityDistribution(params),
        apiMethods.analytics.getAgentPerformance(params),
        apiMethods.analytics.getTimeAnalysis(params),
        apiMethods.analytics.getSatisfactionTrends(params)
      ]);
      
      setDashboardData({
        overview: overviewRes.data || dashboardData.overview,
        trends: trendsRes.data || [],
        categoryBreakdown: categoryRes.data || [],
        priorityDistribution: priorityRes.data || [],
        agentPerformance: agentRes.data || [],
        timeAnalysis: timeRes.data || [],
        satisfactionTrends: satisfactionRes.data || [],
        workloadDistribution: generateWorkloadData(agentRes.data || [])
      });
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const updateRealtimeData = async () => {
    try {
      const response = await apiMethods.analytics.getRealtime();
      setRealtimeData(response.data || realtimeData);
    } catch (error) {
      console.error('Failed to update realtime data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    await updateRealtimeData();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    
    if (range !== 'custom') {
      const days = TIME_RANGES.find(r => r.id === range)?.days || 30;
      setEndDate(dayjs());
      setStartDate(dayjs().subtract(days, 'days'));
    }
  };

  const handleExport = async (format = 'pdf') => {
    try {
      const params = {
        format,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        departments: selectedDepartments,
        agents: selectedAgents,
        includeCharts: true
      };
      
      const response = await apiMethods.analytics.exportReport(params);
      
      // Create download link
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${dayjs().format('YYYY-MM-DD')}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    }
  };

  const generateWorkloadData = (agentData) => {
    return agentData.map(agent => ({
      name: agent.name,
      activeTickets: agent.activeTickets || 0,
      completedToday: agent.completedToday || 0,
      avgResponseTime: agent.avgResponseTime || 0,
      workload: Math.min((agent.activeTickets || 0) / 10 * 100, 100)
    }));
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getMetricTrend = (current, previous) => {
    if (!previous) return { direction: 'neutral', percentage: 0 };
    
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change).toFixed(1)
    };
  };

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={8} sx={{ p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const memoizedCharts = useMemo(() => ({
    trends: (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dashboardData.trends}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="date" 
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
          <RechartsTooltip content={renderCustomTooltip} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="created" 
            stroke={CHART_COLORS.primary[0]} 
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.primary[0], strokeWidth: 2, r: 4 }}
            name="Created"
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke={CHART_COLORS.success[0]} 
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.success[0], strokeWidth: 2, r: 4 }}
            name="Resolved"
          />
        </LineChart>
      </ResponsiveContainer>
    ),
    
    categoryPie: (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dashboardData.categoryBreakdown}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {dashboardData.categoryBreakdown.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS.primary[index % CHART_COLORS.primary.length]} />
            ))}
          </Pie>
          <RechartsTooltip content={renderCustomTooltip} />
        </PieChart>
      </ResponsiveContainer>
    ),
    
    agentPerformance: (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dashboardData.agentPerformance}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="name" 
            stroke={theme.palette.text.secondary}
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke={theme.palette.text.secondary} fontSize={12} />
          <RechartsTooltip content={renderCustomTooltip} />
          <Legend />
          <Bar dataKey="resolved" fill={CHART_COLORS.success[0]} name="Resolved" />
          <Bar dataKey="pending" fill={CHART_COLORS.warning[0]} name="Pending" />
        </BarChart>
      </ResponsiveContainer>
    ),
    
    satisfactionTrend: (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dashboardData.satisfactionTrends}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="date" 
            stroke={theme.palette.text.secondary}
            fontSize={12}
          />
          <YAxis 
            stroke={theme.palette.text.secondary} 
            fontSize={12}
            domain={[0, 5]}
          />
          <RechartsTooltip content={renderCustomTooltip} />
          <Area 
            type="monotone" 
            dataKey="rating" 
            stroke={CHART_COLORS.success[0]}
            fill={alpha(CHART_COLORS.success[0], 0.3)}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }), [dashboardData, theme]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Analytics Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  <AnalyticsIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Analytics Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Comprehensive insights and performance metrics
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{ borderRadius: 2 }}
                >
                  Refresh
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={() => handleExport('pdf')}
                  sx={{ borderRadius: 2 }}
                >
                  Export PDF
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<InsightsIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Generate Report
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {/* Real-time Status */}
          {filters.realTimeUpdates && (
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Badge variant="dot" color="success">
                    <Typography variant="body2" fontWeight="bold">
                      Live Data
                    </Typography>
                  </Badge>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Active Users: {realtimeData.activeUsers}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    System Load: {realtimeData.systemLoad}%
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated: {dayjs().format('HH:mm:ss')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* Filters */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Time Range"
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                >
                  {TIME_RANGES.map(range => (
                    <MenuItem key={range.id} value={range.id}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {dateRange === 'custom' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <MUIDatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <MUIDatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  label="Chart Type"
                  onChange={(e) => setChartType(e.target.value)}
                >
                  {CHART_TYPES.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.showTrendlines}
                      onChange={(e) => setFilters(prev => ({ ...prev, showTrendlines: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Trends"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.realTimeUpdates}
                      onChange={(e) => setFilters(prev => ({ ...prev, realTimeUpdates: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Live"
                />
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
              <Tab icon={<DashboardIcon />} label="Overview" iconPosition="start" />
              <Tab icon={<TrendingUpIcon />} label="Trends & Patterns" iconPosition="start" />
              <Tab icon={<PeopleIcon />} label="Agent Performance" iconPosition="start" />
              <Tab icon={<ReportIcon />} label="Detailed Reports" iconPosition="start" />
              <Tab icon={<InsightsIcon />} label="AI Insights" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={currentTab} index={0}>
            <Grid container spacing={3}>
              {/* Key Metrics */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Key Performance Indicators
                </Typography>
                <Grid container spacing={3}>
                  {Object.entries(dashboardData.overview).map(([key, value]) => {
                    const metric = METRIC_DEFINITIONS[key];
                    if (!metric) return null;
                    
                    const trend = getMetricTrend(value, value); // In real app, compare with previous period
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={2} key={key}>
                        <Zoom in={true} timeout={300}>
                          <MetricCard color={metric.color}>
                            <CardContent sx={{ pb: '16px !important' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Avatar sx={{ bgcolor: `${metric.color}.main`, width: 40, height: 40 }}>
                                  {metric.icon}
                                </Avatar>
                                {trend.direction !== 'neutral' && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {trend.direction === 'up' ? (
                                      <TrendingUpIcon color="success" fontSize="small" />
                                    ) : (
                                      <TrendingDownIcon color="error" fontSize="small" />
                                    )}
                                    <Typography variant="caption" color={trend.direction === 'up' ? 'success.main' : 'error.main'}>
                                      {trend.percentage}%
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              
                              <Typography variant="h4" fontWeight="bold" gutterBottom>
                                {typeof value === 'number' ? value.toLocaleString() : value}
                              </Typography>
                              
                              <Typography variant="body2" color="text.secondary">
                                {metric.label}
                              </Typography>
                            </CardContent>
                          </MetricCard>
                        </Zoom>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>

              {/* Ticket Trends Chart */}
              <Grid item xs={12} md={8}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom>
                    Ticket Volume Trends
                  </Typography>
                  {memoizedCharts.trends}
                </ChartContainer>
              </Grid>

              {/* Category Breakdown */}
              <Grid item xs={12} md={4}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom>
                    Category Distribution
                  </Typography>
                  {memoizedCharts.categoryPie}
                </ChartContainer>
              </Grid>

              {/* Priority Distribution */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Priority Distribution
                  </Typography>
                  <List>
                    {dashboardData.priorityDistribution.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: CHART_COLORS.primary[index], width: 32, height: 32 }}>
                            {item.count}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.priority}
                          secondary={`${item.percentage}% of total tickets`}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={item.percentage}
                          sx={{ width: 60, mr: 2 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Recent Activity */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <List>
                    {[
                      { action: 'Ticket #1234 resolved', time: '2 minutes ago', type: 'success' },
                      { action: 'New ticket created', time: '5 minutes ago', type: 'info' },
                      { action: 'Agent John joined', time: '10 minutes ago', type: 'primary' },
                      { action: 'System maintenance', time: '1 hour ago', type: 'warning' }
                    ].map((activity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${activity.type}.main`, width: 32, height: 32 }}>
                            {activity.type === 'success' && <SuccessIcon />}
                            {activity.type === 'info' && <InfoIcon />}
                            {activity.type === 'warning' && <AlertIcon />}
                            {activity.type === 'primary' && <PeopleIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={activity.action}
                          secondary={activity.time}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Trends & Patterns Tab */}
          <TabPanel value={currentTab} index={1}>
            <Grid container spacing={3}>
              {/* Customer Satisfaction Trends */}
              <Grid item xs={12}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom>
                    Customer Satisfaction Trends
                  </Typography>
                  {memoizedCharts.satisfactionTrend}
                </ChartContainer>
              </Grid>

              {/* Time-based Analysis */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Peak Hours Analysis
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={realtimeData.ticketsPerHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <RechartsTooltip content={renderCustomTooltip} />
                      <Bar dataKey="tickets" fill={CHART_COLORS.primary[0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Resolution Time Patterns */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Resolution Time Patterns
                  </Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dashboardData.timeAnalysis}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <RechartsTooltip content={renderCustomTooltip} />
                      <Line 
                        type="monotone" 
                        dataKey="avgTime" 
                        stroke={CHART_COLORS.warning[0]} 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Predictive Insights */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    AI-Powered Insights
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Predicted Ticket Volume</Typography>
                        <Typography variant="body2">
                          Expected 15% increase in tickets next week based on historical patterns.
                        </Typography>
                      </Alert>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Resource Alert</Typography>
                        <Typography variant="body2">
                          Consider adding 2 more agents during peak hours (2-4 PM).
                        </Typography>
                      </Alert>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Performance Trend</Typography>
                        <Typography variant="body2">
                          Resolution time improved by 12% compared to last month.
                        </Typography>
                      </Alert>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Agent Performance Tab */}
          <TabPanel value={currentTab} index={2}>
            <Grid container spacing={3}>
              {/* Agent Performance Chart */}
              <Grid item xs={12} md={8}>
                <ChartContainer>
                  <Typography variant="h6" gutterBottom>
                    Agent Performance Comparison
                  </Typography>
                  {memoizedCharts.agentPerformance}
                </ChartContainer>
              </Grid>

              {/* Workload Distribution */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Current Workload
                  </Typography>
                  <List>
                    {dashboardData.workloadDistribution.slice(0, 5).map((agent, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {agent.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={agent.name}
                          secondary={`${agent.activeTickets} active tickets`}
                        />
                        <Box sx={{ width: 60 }}>
                          <LinearProgress
                            variant="determinate"
                            value={agent.workload}
                            color={agent.workload > 80 ? 'error' : agent.workload > 60 ? 'warning' : 'success'}
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Performance Metrics Table */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ borderRadius: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Agent</TableCell>
                          <TableCell align="right">Tickets Resolved</TableCell>
                          <TableCell align="right">Avg Response Time</TableCell>
                          <TableCell align="right">Customer Rating</TableCell>
                          <TableCell align="right">Active Tickets</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.agentPerformance.map((agent, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {agent.name.charAt(0)}
                                </Avatar>
                                {agent.name}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{agent.resolved}</TableCell>
                            <TableCell align="right">{formatDuration(agent.avgResponseTime)}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                <StarIcon fontSize="small" color="warning" />
                                {agent.rating || '4.5'}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{agent.active || agent.pending}</TableCell>
                            <TableCell align="right">
                              <Chip
                                label={agent.status || 'Online'}
                                color="success"
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
          </TabPanel>

          {/* Detailed Reports Tab */}
          <TabPanel value={currentTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Generate comprehensive reports with custom date ranges and detailed breakdowns.
                </Alert>
              </Grid>

              {/* Report Generation */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Generate Custom Report
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Report Type</InputLabel>
                      <Select defaultValue="performance" label="Report Type">
                        <MenuItem value="performance">Performance Summary</MenuItem>
                        <MenuItem value="trends">Trend Analysis</MenuItem>
                        <MenuItem value="satisfaction">Customer Satisfaction</MenuItem>
                        <MenuItem value="workload">Workload Distribution</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="contained"
                      startIcon={<ReportIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Generate Report
                    </Button>
                  </Box>
                </Paper>
              </Grid>

              {/* Export Options */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Export Options
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        startIcon={<PdfIcon />}
                        fullWidth
                        onClick={() => handleExport('pdf')}
                      >
                        PDF Report
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        startIcon={<TableIcon />}
                        fullWidth
                        onClick={() => handleExport('csv')}
                      >
                        CSV Data
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Historical Data Table */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ borderRadius: 2 }}>
                  <Box sx={{ p: 3, pb: 0 }}>
                    <Typography variant="h6">
                      Historical Performance Data
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Tickets Created</TableCell>
                          <TableCell align="right">Tickets Resolved</TableCell>
                          <TableCell align="right">Avg Resolution Time</TableCell>
                          <TableCell align="right">Customer Satisfaction</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData.trends.slice(-10).map((row, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{row.date}</TableCell>
                            <TableCell align="right">{row.created}</TableCell>
                            <TableCell align="right">{row.resolved}</TableCell>
                            <TableCell align="right">{formatDuration(row.avgTime || 120)}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                <StarIcon fontSize="small" color="warning" />
                                {(Math.random() * 2 + 3).toFixed(1)}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={100}
                    page={0}
                    onPageChange={() => {}}
                    rowsPerPage={10}
                    onRowsPerPageChange={() => {}}
                  />
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          {/* AI Insights Tab */}
          <TabPanel value={currentTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  AI-powered insights help you understand patterns and optimize your support operations.
                </Alert>
              </Grid>

              {/* AI Recommendations */}
              <Grid item xs={12} md={8}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    AI Recommendations
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <TrendingUpIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Optimize Agent Allocation"
                        secondary="Move 2 agents from morning shift to afternoon (2-6 PM) to handle peak ticket volume."
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <AlertIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Knowledge Base Update"
                        secondary="Add FAQ entries for 'password reset' and 'network issues' - these represent 40% of tickets."
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <InfoIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Training Opportunity"
                        secondary="Provide additional training on software issues for agents with lower resolution rates."
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              {/* Prediction Models */}
              <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Predictions
                  </Typography>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <CircularProgress
                      variant="determinate"
                      value={75}
                      size={100}
                      thickness={4}
                      sx={{ color: 'success.main' }}
                    />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      75% Accuracy
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Prediction Model Performance
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Next Week Forecast:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • 15% increase in ticket volume
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Peak hours: 2-4 PM daily
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Hardware issues trend up 8%
                  </Typography>
                </Paper>
              </Grid>

              {/* ML Model Performance */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Machine Learning Model Performance
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                          92%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ticket Categorization Accuracy
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="success.main" fontWeight="bold">
                          87%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Priority Prediction Accuracy
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="warning.main" fontWeight="bold">
                          78%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Resolution Time Prediction
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsDashboard;