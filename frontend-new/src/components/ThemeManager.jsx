import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ColorPicker,
  Tooltip,
  Alert,
  Snackbar,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha,
  styled
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  BrightnessAuto as AutoModeIcon,
  ColorLens as ColorIcon,
  Wallpaper as WallpaperIcon,
  TextFields as FontIcon,
  AspectRatio as LayoutIcon,
  Speed as AnimationIcon,
  Visibility as ContrastIcon,
  Save as SaveIcon,
  Refresh as ResetIcon,
  GetApp as ExportIcon,
  Publish as ImportIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  CloudUpload as UploadIcon,
  Tune as CustomizeIcon,
  AutoAwesome as MagicIcon,
  Gradient as GradientIcon,
  FormatColorFill as FillIcon,
  Architecture as StructureIcon
} from '@mui/icons-material';
import { HexColorPicker } from 'react-colorful';
import { useThemeContext } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

// Predefined theme presets
const THEME_PRESETS = [
  {
    id: 'default',
    name: 'Default Blue',
    description: 'Clean and professional blue theme',
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      success: '#2e7d32',
      warning: '#ed6c02',
      error: '#d32f2f',
      info: '#0288d1'
    },
    favorite: false,
    category: 'professional'
  },
  {
    id: 'purple',
    name: 'Purple Dream',
    description: 'Modern purple gradient theme',
    colors: {
      primary: '#7b1fa2',
      secondary: '#512da8',
      success: '#388e3c',
      warning: '#f57c00',
      error: '#d32f2f',
      info: '#1976d2'
    },
    favorite: false,
    category: 'creative'
  },
  {
    id: 'green',
    name: 'Nature Green',
    description: 'Fresh and natural green theme',
    colors: {
      primary: '#2e7d32',
      secondary: '#689f38',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3'
    },
    favorite: false,
    category: 'nature'
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    description: 'Warm and energetic orange theme',
    colors: {
      primary: '#f57c00',
      secondary: '#ff5722',
      success: '#4caf50',
      warning: '#ffc107',
      error: '#e91e63',
      info: '#00bcd4'
    },
    favorite: false,
    category: 'vibrant'
  },
  {
    id: 'dark_blue',
    name: 'Deep Ocean',
    description: 'Professional dark blue theme',
    colors: {
      primary: '#0d47a1',
      secondary: '#1a237e',
      success: '#1b5e20',
      warning: '#e65100',
      error: '#b71c1c',
      info: '#01579b'
    },
    favorite: false,
    category: 'professional'
  },
  {
    id: 'pink',
    name: 'Rose Gold',
    description: 'Elegant pink and gold combination',
    colors: {
      primary: '#e91e63',
      secondary: '#ff6f00',
      success: '#388e3c',
      warning: '#f57c00',
      error: '#d32f2f',
      info: '#1976d2'
    },
    favorite: false,
    category: 'elegant'
  }
];

// Font options
const FONT_OPTIONS = [
  { id: 'roboto', name: 'Roboto', family: '"Roboto", "Helvetica", "Arial", sans-serif' },
  { id: 'inter', name: 'Inter', family: '"Inter", "Helvetica", "Arial", sans-serif' },
  { id: 'poppins', name: 'Poppins', family: '"Poppins", "Helvetica", "Arial", sans-serif' },
  { id: 'opensans', name: 'Open Sans', family: '"Open Sans", "Helvetica", "Arial", sans-serif' },
  { id: 'lato', name: 'Lato', family: '"Lato", "Helvetica", "Arial", sans-serif' },
  { id: 'nunito', name: 'Nunito', family: '"Nunito", "Helvetica", "Arial", sans-serif' }
];

// Layout options
const LAYOUT_OPTIONS = [
  { id: 'comfortable', name: 'Comfortable', spacing: 3, borderRadius: 2 },
  { id: 'compact', name: 'Compact', spacing: 2, borderRadius: 1 },
  { id: 'spacious', name: 'Spacious', spacing: 4, borderRadius: 3 }
];

// Animation speeds
const ANIMATION_SPEEDS = [
  { id: 'slow', name: 'Slow', duration: 500 },
  { id: 'normal', name: 'Normal', duration: 300 },
  { id: 'fast', name: 'Fast', duration: 150 },
  { id: 'none', name: 'No Animation', duration: 0 }
];

// Custom styled components
const ThemePreviewCard = styled(Card)(({ theme, colors, selected }) => ({
  cursor: 'pointer',
  border: selected ? `3px solid ${theme.palette.primary.main}` : '1px solid transparent',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
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
    background: `linear-gradient(90deg, ${colors?.primary || theme.palette.primary.main}, ${colors?.secondary || theme.palette.secondary.main})`,
  }
}));

const ColorSwatch = styled(Box)(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: color,
  border: '2px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
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

const ThemeManager = ({ embedded = false, onClose = null }) => {
  const theme = useTheme();
  const {
    currentTheme,
    themeMode,
    customColors,
    settings,
    updateTheme,
    toggleThemeMode,
    updateCustomColors,
    updateSettings,
    exportTheme,
    importTheme,
    resetToDefault
  } = useThemeContext();

  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [customThemeDialog, setCustomThemeDialog] = useState(false);
  const [colorPickerDialog, setColorPickerDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentColorKey, setCurrentColorKey] = useState('primary');
  const [currentColor, setCurrentColor] = useState('#1976d2');
  const [customThemeName, setCustomThemeName] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Custom theme state
  const [customTheme, setCustomTheme] = useState({
    name: '',
    description: '',
    colors: {
      primary: '#1976d2',
      secondary: '#dc004e',
      success: '#2e7d32',
      warning: '#ed6c02',
      error: '#d32f2f',
      info: '#0288d1'
    }
  });

  // Advanced settings state
  const [advancedSettings, setAdvancedSettings] = useState({
    fontSize: 14,
    lineHeight: 1.5,
    letterSpacing: 0,
    borderRadius: 4,
    elevation: 2,
    animationSpeed: 'normal',
    fontFamily: 'roboto',
    layout: 'comfortable',
    contrast: 'normal',
    reducedMotion: false,
    highContrast: false,
    customCSS: ''
  });

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = () => {
    try {
      const savedFavorites = localStorage.getItem('theme_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }

      const savedSettings = localStorage.getItem('advanced_theme_settings');
      if (savedSettings) {
        setAdvancedSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch (error) {
      console.error('Failed to load theme preferences:', error);
    }
  };

  const saveUserPreferences = () => {
    try {
      localStorage.setItem('theme_favorites', JSON.stringify(favorites));
      localStorage.setItem('advanced_theme_settings', JSON.stringify(advancedSettings));
      toast.success('Theme preferences saved!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    updateCustomColors(preset.colors);
    updateTheme(preset.id);
    toast.success(`Applied ${preset.name} theme!`);
  };

  const handleColorChange = (colorKey, color) => {
    setCurrentColor(color);
    const newColors = { ...customColors, [colorKey]: color };
    updateCustomColors(newColors);
    setCustomTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: color }
    }));
  };

  const openColorPicker = (colorKey) => {
    setCurrentColorKey(colorKey);
    setCurrentColor(customColors[colorKey] || customTheme.colors[colorKey]);
    setColorPickerDialog(true);
  };

  const toggleFavorite = (presetId) => {
    const newFavorites = favorites.includes(presetId)
      ? favorites.filter(id => id !== presetId)
      : [...favorites, presetId];
    setFavorites(newFavorites);
  };

  const createCustomTheme = () => {
    if (!customTheme.name.trim()) {
      toast.error('Please enter a theme name');
      return;
    }

    const newTheme = {
      ...customTheme,
      id: `custom_${Date.now()}`,
      category: 'custom'
    };

    // Add to presets (in a real app, this would be saved to backend)
    THEME_PRESETS.push(newTheme);
    
    toast.success('Custom theme created successfully!');
    setCustomThemeDialog(false);
    setCustomTheme({
      name: '',
      description: '',
      colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        success: '#2e7d32',
        warning: '#ed6c02',
        error: '#d32f2f',
        info: '#0288d1'
      }
    });
  };

  const applyAdvancedSettings = () => {
    updateSettings(advancedSettings);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--font-size-base', `${advancedSettings.fontSize}px`);
    root.style.setProperty('--line-height-base', advancedSettings.lineHeight);
    root.style.setProperty('--letter-spacing-base', `${advancedSettings.letterSpacing}px`);
    root.style.setProperty('--border-radius-base', `${advancedSettings.borderRadius}px`);
    
    // Apply font family
    const fontOption = FONT_OPTIONS.find(f => f.id === advancedSettings.fontFamily);
    if (fontOption) {
      root.style.setProperty('--font-family-base', fontOption.family);
    }

    toast.success('Advanced settings applied!');
  };

  const exportCurrentTheme = () => {
    const themeData = {
      mode: themeMode,
      colors: customColors,
      settings: advancedSettings,
      timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(themeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Theme exported successfully!');
  };

  const handleImportTheme = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target.result);
        
        if (themeData.colors) updateCustomColors(themeData.colors);
        if (themeData.settings) setAdvancedSettings(themeData.settings);
        if (themeData.mode) toggleThemeMode(themeData.mode);
        
        toast.success('Theme imported successfully!');
      } catch (error) {
        toast.error('Invalid theme file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredPresets = THEME_PRESETS.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || preset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(THEME_PRESETS.map(p => p.category))];

  return (
    <Paper
      elevation={embedded ? 8 : 2}
      sx={{
        position: embedded ? 'fixed' : 'relative',
        top: embedded ? '50%' : 'auto',
        left: embedded ? '50%' : 'auto',
        transform: embedded ? 'translate(-50%, -50%)' : 'none',
        width: embedded ? '90vw' : '100%',
        maxWidth: embedded ? 1200 : 'none',
        height: embedded ? '90vh' : 'auto',
        borderRadius: embedded ? 3 : 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: embedded ? 1300 : 'auto'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
            <PaletteIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Advanced Theme Manager
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Customize colors, fonts, layouts, and more
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              sx={{ color: 'inherit' }}
              onClick={() => toggleThemeMode()}
            >
              {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Preview Mode">
            <IconButton
              sx={{ color: 'inherit' }}
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Badge variant="dot" color="warning" invisible={!previewMode}>
                <PreviewIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {embedded && onClose && (
            <Tooltip title="Close">
              <IconButton sx={{ color: 'inherit' }} onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PaletteIcon />} label="Theme Presets" iconPosition="start" />
          <Tab icon={<ColorIcon />} label="Custom Colors" iconPosition="start" />
          <Tab icon={<FontIcon />} label="Typography" iconPosition="start" />
          <Tab icon={<LayoutIcon />} label="Layout & Spacing" iconPosition="start" />
          <Tab icon={<AnimationIcon />} label="Advanced" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Theme Presets Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {/* Search and Filter */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Search themes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={categoryFilter}
                        label="Category"
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Categories</MenuItem>
                        {categories.map(category => (
                          <MenuItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => setCustomThemeDialog(true)}
                    >
                      Create Custom
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Theme Grid */}
            {filteredPresets.map((preset, index) => (
              <Grid item xs={12} sm={6} md={4} key={preset.id}>
                <Zoom in={true} timeout={300} style={{ transitionDelay: `${index * 100}ms` }}>
                  <ThemePreviewCard
                    colors={preset.colors}
                    selected={selectedPreset === preset.id}
                    onClick={() => handlePresetSelect(preset)}
                  >
                    <CardContent sx={{ pb: '16px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {preset.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(preset.id);
                          }}
                        >
                          {favorites.includes(preset.id) ? (
                            <StarIcon color="warning" />
                          ) : (
                            <StarBorderIcon />
                          )}
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {preset.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {Object.entries(preset.colors).slice(0, 4).map(([key, color]) => (
                          <ColorSwatch key={key} color={color} />
                        ))}
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={preset.category}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {selectedPreset === preset.id && (
                          <Chip
                            icon={<CheckIcon />}
                            label="Active"
                            size="small"
                            color="primary"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </ThemePreviewCard>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Custom Colors Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Click on any color below to customize it. Changes are applied immediately.
              </Alert>
            </Grid>
            
            {Object.entries(customColors || {}).map(([colorKey, colorValue]) => (
              <Grid item xs={12} sm={6} md={4} key={colorKey}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-2px)' },
                    transition: 'transform 0.2s'
                  }}
                  onClick={() => openColorPicker(colorKey)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <ColorSwatch color={colorValue} />
                      <Box>
                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                          {colorKey}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {colorValue}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Color preview bar */}
                    <Box
                      sx={{
                        height: 40,
                        borderRadius: 1,
                        background: `linear-gradient(45deg, ${colorValue}, ${alpha(colorValue, 0.7)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      Click to customize
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Typography Tab */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Font Family
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Select
                      value={advancedSettings.fontFamily}
                      onChange={(e) => setAdvancedSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                    >
                      {FONT_OPTIONS.map(font => (
                        <MenuItem key={font.id} value={font.id}>
                          <Typography sx={{ fontFamily: font.family }}>
                            {font.name}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Typography variant="body2" gutterBottom>
                    Font Size: {advancedSettings.fontSize}px
                  </Typography>
                  <Slider
                    value={advancedSettings.fontSize}
                    onChange={(e, value) => setAdvancedSettings(prev => ({ ...prev, fontSize: value }))}
                    min={12}
                    max={18}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="body2" gutterBottom>
                    Line Height: {advancedSettings.lineHeight}
                  </Typography>
                  <Slider
                    value={advancedSettings.lineHeight}
                    onChange={(e, value) => setAdvancedSettings(prev => ({ ...prev, lineHeight: value }))}
                    min={1.2}
                    max={2.0}
                    step={0.1}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="body2" gutterBottom>
                    Letter Spacing: {advancedSettings.letterSpacing}px
                  </Typography>
                  <Slider
                    value={advancedSettings.letterSpacing}
                    onChange={(e, value) => setAdvancedSettings(prev => ({ ...prev, letterSpacing: value }))}
                    min={-1}
                    max={2}
                    step={0.1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Typography Preview
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      fontSize: `${advancedSettings.fontSize}px`,
                      lineHeight: advancedSettings.lineHeight,
                      letterSpacing: `${advancedSettings.letterSpacing}px`,
                      fontFamily: FONT_OPTIONS.find(f => f.id === advancedSettings.fontFamily)?.family
                    }}
                  >
                    <Typography variant="h4" gutterBottom>
                      Heading 1
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      Heading 2
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      Heading 3
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      This is body text with your custom typography settings. 
                      The quick brown fox jumps over the lazy dog.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This is secondary text that shows how your font choices 
                      affect readability and overall design.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Layout & Spacing Tab */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Layout Settings
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    Layout Style
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <Select
                      value={advancedSettings.layout}
                      onChange={(e) => setAdvancedSettings(prev => ({ ...prev, layout: e.target.value }))}
                    >
                      {LAYOUT_OPTIONS.map(layout => (
                        <MenuItem key={layout.id} value={layout.id}>
                          {layout.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Typography variant="body2" gutterBottom>
                    Border Radius: {advancedSettings.borderRadius}px
                  </Typography>
                  <Slider
                    value={advancedSettings.borderRadius}
                    onChange={(e, value) => setAdvancedSettings(prev => ({ ...prev, borderRadius: value }))}
                    min={0}
                    max={16}
                    marks
                    valueLabelDisplay="auto"
                    sx={{ mb: 3 }}
                  />
                  
                  <Typography variant="body2" gutterBottom>
                    Elevation Level: {advancedSettings.elevation}
                  </Typography>
                  <Slider
                    value={advancedSettings.elevation}
                    onChange={(e, value) => setAdvancedSettings(prev => ({ ...prev, elevation: value }))}
                    min={0}
                    max={24}
                    marks
                    valueLabelDisplay="auto"
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Layout Preview
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper
                      elevation={advancedSettings.elevation}
                      sx={{
                        p: 2,
                        borderRadius: `${advancedSettings.borderRadius}px`
                      }}
                    >
                      <Typography variant="h6">Sample Card</Typography>
                      <Typography variant="body2" color="text.secondary">
                        This card shows your elevation and border radius settings.
                      </Typography>
                    </Paper>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        sx={{ borderRadius: `${advancedSettings.borderRadius}px` }}
                      >
                        Button
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ borderRadius: `${advancedSettings.borderRadius}px` }}
                      >
                        Outlined
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Advanced Tab */}
        <TabPanel value={currentTab} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Animation & Accessibility
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Animation Speed</InputLabel>
                    <Select
                      value={advancedSettings.animationSpeed}
                      label="Animation Speed"
                      onChange={(e) => setAdvancedSettings(prev => ({ ...prev, animationSpeed: e.target.value }))}
                    >
                      {ANIMATION_SPEEDS.map(speed => (
                        <MenuItem key={speed.id} value={speed.id}>
                          {speed.name} ({speed.duration}ms)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={advancedSettings.reducedMotion}
                        onChange={(e) => setAdvancedSettings(prev => ({ ...prev, reducedMotion: e.target.checked }))}
                      />
                    }
                    label="Reduce Motion (Accessibility)"
                    sx={{ mb: 2 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={advancedSettings.highContrast}
                        onChange={(e) => setAdvancedSettings(prev => ({ ...prev, highContrast: e.target.checked }))}
                      />
                    }
                    label="High Contrast Mode"
                    sx={{ mb: 3 }}
                  />
                  
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckIcon />}
                    onClick={applyAdvancedSettings}
                    sx={{ mb: 2 }}
                  >
                    Apply Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Import/Export & Reset
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      onClick={exportCurrentTheme}
                    >
                      Export Current Theme
                    </Button>
                    
                    <input
                      accept=".json"
                      style={{ display: 'none' }}
                      id="import-theme-file"
                      type="file"
                      onChange={handleImportTheme}
                    />
                    <label htmlFor="import-theme-file">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<ImportIcon />}
                      >
                        Import Theme File
                      </Button>
                    </label>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<ResetIcon />}
                      onClick={() => {
                        resetToDefault();
                        toast.success('Theme reset to default!');
                      }}
                    >
                      Reset to Default
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={saveUserPreferences}
                    >
                      Save All Preferences
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Custom CSS */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Custom CSS (Advanced Users)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="/* Add your custom CSS here */&#10;.custom-class {&#10;  color: #your-color;&#10;}"
                    value={advancedSettings.customCSS}
                    onChange={(e) => setAdvancedSettings(prev => ({ ...prev, customCSS: e.target.value }))}
                    sx={{ fontFamily: 'monospace' }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

      {/* Color Picker Dialog */}
      <Dialog
        open={colorPickerDialog}
        onClose={() => setColorPickerDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Customize {currentColorKey.charAt(0).toUpperCase() + currentColorKey.slice(1)} Color
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
            <HexColorPicker
              color={currentColor}
              onChange={(color) => handleColorChange(currentColorKey, color)}
            />
            <TextField
              label="Hex Color"
              value={currentColor}
              onChange={(e) => handleColorChange(currentColorKey, e.target.value)}
              sx={{ fontFamily: 'monospace' }}
            />
            <Box
              sx={{
                width: 100,
                height: 50,
                backgroundColor: currentColor,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorPickerDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleColorChange(currentColorKey, currentColor);
              setColorPickerDialog(false);
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Theme Dialog */}
      <Dialog
        open={customThemeDialog}
        onClose={() => setCustomThemeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Custom Theme</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Theme Name"
                value={customTheme.name}
                onChange={(e) => setCustomTheme(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={customTheme.description}
                onChange={(e) => setCustomTheme(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            {Object.entries(customTheme.colors).map(([colorKey, colorValue]) => (
              <Grid item xs={6} sm={4} key={colorKey}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => openColorPicker(colorKey)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ColorSwatch color={colorValue} />
                    <Box>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {colorKey}
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {colorValue}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomThemeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={createCustomTheme}>
            Create Theme
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Mode Alert */}
      {previewMode && (
        <Alert
          severity="warning"
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1400
          }}
          action={
            <Button color="inherit" size="small" onClick={() => setPreviewMode(false)}>
              EXIT PREVIEW
            </Button>
          }
        >
          Preview Mode Active
        </Alert>
      )}
    </Paper>
  );
};

export default ThemeManager;