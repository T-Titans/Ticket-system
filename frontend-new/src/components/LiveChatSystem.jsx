import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Menu,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  NotificationsOff as NotificationOffIcon,
  VolumeUp as SoundOnIcon,
  VolumeOff as SoundOffIcon,
  Circle as OnlineIcon,
  Schedule as AwayIcon,
  DoNotDisturb as BusyIcon,
  OfflinePin as OfflineIcon,
  Star as StarIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Phone as CallIcon,
  VideoCall as VideoIcon,
  ScreenShare as ScreenShareIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,
  AccessTime as TimeIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Support as SupportIcon,
  Chat as ChatIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiMethods } from '../../api';
import { toast } from 'react-toastify';

// User status configurations
const USER_STATUS = {
  online: { label: 'Online', color: 'success', icon: <OnlineIcon /> },
  away: { label: 'Away', color: 'warning', icon: <AwayIcon /> },
  busy: { label: 'Busy', color: 'error', icon: <BusyIcon /> },
  offline: { label: 'Offline', color: 'default', icon: <OfflineIcon /> }
};

// Message types
const MESSAGE_TYPES = {
  text: 'text',
  file: 'file',
  image: 'image',
  system: 'system',
  ticket_reference: 'ticket_reference'
};

// Chat room types
const ROOM_TYPES = {
  direct: 'direct_message',
  support: 'support_chat',
  group: 'group_chat',
  ticket: 'ticket_chat'
};

// Emoji reactions
const EMOJI_REACTIONS = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡', '👏'];

const LiveChatSystem = ({ ticketId = null, embedded = false, onClose = null }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);

  // Main state
  const [chatRooms, setChatRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [supportAgents, setSupportAgents] = useState([]);
  
  // UI state
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Message state
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    enterToSend: true,
    showTimestamps: true,
    autoJoinSupport: true,
    status: 'online'
  });
  
  // File upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    initializeChat();
    setupWebSocketConnection();
    
    return () => {
      // Cleanup WebSocket connection
      if (window.chatSocket) {
        window.chatSocket.close();
      }
    };
  }, []);

  useEffect(() => {
    if (ticketId && !activeRoom) {
      // Auto-join ticket chat room
      joinOrCreateTicketRoom(ticketId);
    }
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Load chat rooms
      const roomsResponse = await apiMethods.chat.getRooms();
      setChatRooms(roomsResponse.data.rooms || []);
      
      // Load online users
      const usersResponse = await apiMethods.chat.getOnlineUsers();
      setOnlineUsers(usersResponse.data.users || []);
      
      // Load support agents
      const agentsResponse = await apiMethods.chat.getSupportAgents();
      setSupportAgents(agentsResponse.data.agents || []);
      
      // Auto-join general support room if enabled
      if (settings.autoJoinSupport && !ticketId) {
        const supportRoom = roomsResponse.data.rooms?.find(room => room.type === ROOM_TYPES.support);
        if (supportRoom) {
          setActiveRoom(supportRoom);
          loadMessages(supportRoom.id);
        }
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      toast.error('Failed to load chat data');
    }
  };

  const setupWebSocketConnection = () => {
    // WebSocket connection for real-time messaging
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/`;
    
    window.chatSocket = new WebSocket(wsUrl);
    
    window.chatSocket.onopen = () => {
      console.log('Chat WebSocket connected');
      updateUserStatus(settings.status);
    };
    
    window.chatSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    window.chatSocket.onclose = () => {
      console.log('Chat WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (!window.chatSocket || window.chatSocket.readyState !== WebSocket.OPEN) {
          setupWebSocketConnection();
        }
      }, 3000);
    };
    
    window.chatSocket.onerror = (error) => {
      console.error('Chat WebSocket error:', error);
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        if (data.room_id === activeRoom?.id) {
          setMessages(prev => [...prev, data.message]);
          if (settings.sounds && data.message.sender.id !== user.id) {
            playNotificationSound();
          }
        }
        updateChatRoomLastMessage(data.room_id, data.message);
        break;
        
      case 'user_typing':
        if (data.room_id === activeRoom?.id && data.user.id !== user.id) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.id !== data.user.id);
            return [...filtered, { ...data.user, timestamp: Date.now() }];
          });
          
          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u.id !== data.user.id));
          }, 3000);
        }
        break;
        
      case 'user_status_update':
        setOnlineUsers(prev => 
          prev.map(u => u.id === data.user.id ? { ...u, status: data.status } : u)
        );
        break;
        
      case 'message_reaction':
        if (data.room_id === activeRoom?.id) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === data.message_id
                ? { ...msg, reactions: data.reactions }
                : msg
            )
          );
        }
        break;
        
      case 'support_agent_joined':
        if (data.room_id === activeRoom?.id) {
          toast.success(`${data.agent.name} joined the conversation`);
        }
        break;
        
      default:
        break;
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const response = await apiMethods.chat.getMessages(roomId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load chat history');
    }
  };

  const joinOrCreateTicketRoom = async (ticketId) => {
    try {
      const response = await apiMethods.chat.joinTicketRoom(ticketId);
      const room = response.data.room;
      
      setActiveRoom(room);
      loadMessages(room.id);
      
      // Add to chat rooms if not already present
      setChatRooms(prev => {
        const exists = prev.find(r => r.id === room.id);
        return exists ? prev : [...prev, room];
      });
    } catch (error) {
      console.error('Failed to join ticket room:', error);
      toast.error('Failed to join ticket chat');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom) return;
    
    const messageData = {
      room_id: activeRoom.id,
      content: newMessage.trim(),
      type: MESSAGE_TYPES.text,
      reply_to: replyingTo?.id || null
    };
    
    try {
      // Send via WebSocket for real-time delivery
      if (window.chatSocket?.readyState === WebSocket.OPEN) {
        window.chatSocket.send(JSON.stringify({
          type: 'send_message',
          ...messageData
        }));
      }
      
      // Clear input and states
      setNewMessage('');
      setReplyingTo(null);
      setIsTyping(false);
      
      // Focus back to input
      chatInputRef.current?.focus();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('room_id', activeRoom.id);
        
        const response = await apiMethods.chat.uploadFile(formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
        
        // Send file message
        if (window.chatSocket?.readyState === WebSocket.OPEN) {
          window.chatSocket.send(JSON.stringify({
            type: 'send_message',
            room_id: activeRoom.id,
            content: file.name,
            type: file.type.startsWith('image/') ? MESSAGE_TYPES.image : MESSAGE_TYPES.file,
            file_url: response.data.file_url,
            file_size: file.size,
            file_type: file.type
          }));
        }
      }
      
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const handleTyping = () => {
    if (!isTyping && activeRoom) {
      setIsTyping(true);
      
      if (window.chatSocket?.readyState === WebSocket.OPEN) {
        window.chatSocket.send(JSON.stringify({
          type: 'user_typing',
          room_id: activeRoom.id,
          user: user
        }));
      }
      
      // Stop typing indicator after 3 seconds of inactivity
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      if (window.chatSocket?.readyState === WebSocket.OPEN) {
        window.chatSocket.send(JSON.stringify({
          type: 'add_reaction',
          message_id: messageId,
          emoji: emoji,
          room_id: activeRoom.id
        }));
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const updateUserStatus = (status) => {
    setSettings(prev => ({ ...prev, status }));
    
    if (window.chatSocket?.readyState === WebSocket.OPEN) {
      window.chatSocket.send(JSON.stringify({
        type: 'update_status',
        status: status
      }));
    }
  };

  const playNotificationSound = () => {
    if (settings.sounds) {
      // Create audio notification
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback for browsers that don't allow auto-play
        console.log('Could not play notification sound');
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    if (fileType.includes('document') || fileType.includes('text')) return <DocIcon />;
    return <FileIcon />;
  };

  const getUserStatusIcon = (status) => {
    const config = USER_STATUS[status] || USER_STATUS.offline;
    return (
      <Tooltip title={config.label}>
        <Box sx={{ color: `${config.color}.main`, display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </Box>
      </Tooltip>
    );
  };

  const updateChatRoomLastMessage = (roomId, message) => {
    setChatRooms(prev =>
      prev.map(room =>
        room.id === roomId
          ? { ...room, lastMessage: message, updatedAt: new Date().toISOString() }
          : room
      )
    );
  };

  if (embedded && isMinimized) {
    return (
      <Fade in={true}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 300,
            height: 60,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            cursor: 'pointer',
            bgcolor: theme.palette.primary.main,
            color: 'white',
            zIndex: 1300
          }}
          onClick={() => setIsMinimized(false)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon />
            <Typography variant="body2" fontWeight="bold">
              Live Support Chat
            </Typography>
            {messages.filter(m => !m.read && m.sender.id !== user.id).length > 0 && (
              <Badge
                badgeContent={messages.filter(m => !m.read && m.sender.id !== user.id).length}
                color="error"
              />
            )}
          </Box>
          <IconButton size="small" sx={{ color: 'white' }}>
            <ChatIcon />
          </IconButton>
        </Paper>
      </Fade>
    );
  }

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper
        elevation={embedded ? 8 : 2}
        sx={{
          position: embedded ? 'fixed' : 'relative',
          bottom: embedded ? 20 : 'auto',
          right: embedded ? 20 : 'auto',
          width: embedded ? (isFullscreen ? '90vw' : 400) : '100%',
          height: embedded ? (isFullscreen ? '90vh' : 600) : 600,
          borderRadius: embedded ? 3 : 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: embedded ? 1300 : 'auto'
        }}
      >
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), width: 32, height: 32 }}>
              {activeRoom?.type === ROOM_TYPES.support ? <SupportIcon /> : <ChatIcon />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {activeRoom?.name || 'Live Support Chat'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {activeRoom?.type === ROOM_TYPES.support ? (
                  `${supportAgents.filter(a => a.status === 'online').length} agents online`
                ) : (
                  `${onlineUsers.length} users online`
                )}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Users">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => setShowUserList(!showUserList)}
              >
                <Badge badgeContent={onlineUsers.length} color="error">
                  <PeopleIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton
                size="small"
                sx={{ color: 'white' }}
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            {embedded && (
              <>
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  <IconButton
                    size="small"
                    sx={{ color: 'white' }}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                  >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Minimize">
                  <IconButton
                    size="small"
                    sx={{ color: 'white' }}
                    onClick={() => setIsMinimized(true)}
                  >
                    <MinimizeIcon />
                  </IconButton>
                </Tooltip>
                
                {onClose && (
                  <Tooltip title="Close">
                    <IconButton
                      size="small"
                      sx={{ color: 'white' }}
                      onClick={onClose}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Box>
        </Box>

        {/* Main Chat Area */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* User List Sidebar */}
          {showUserList && (
            <Slide direction="right" in={showUserList}>
              <Paper
                elevation={1}
                sx={{
                  width: 200,
                  borderRadius: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                  overflow: 'auto'
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Support Agents ({supportAgents.filter(a => a.status === 'online').length})
                  </Typography>
                  <List dense>
                    {supportAgents.map((agent) => (
                      <ListItem key={agent.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {agent.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={agent.name}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                        {getUserStatusIcon(agent.status)}
                      </ListItem>
                    ))}
                  </List>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Online Users ({onlineUsers.length})
                  </Typography>
                  <List dense>
                    {onlineUsers.slice(0, 10).map((user) => (
                      <ListItem key={user.id} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 24, height: 24 }}>
                            {user.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                        {getUserStatusIcon(user.status)}
                      </ListItem>
                    ))}
                    {onlineUsers.length > 10 && (
                      <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                        +{onlineUsers.length - 10} more users
                      </Typography>
                    )}
                  </List>
                </Box>
              </Paper>
            </Slide>
          )}

          {/* Messages Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Messages List */}
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              {messages.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'text.secondary'
                  }}
                >
                  <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    Start a conversation
                  </Typography>
                  <Typography variant="body2">
                    Send a message to get help from our support team
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => (
                  <Zoom in={true} timeout={300} key={message.id} style={{ transitionDelay: `${index * 50}ms` }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: message.sender.id === user.id ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 1,
                        mb: 1
                      }}
                    >
                      {message.sender.id !== user.id && (
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {message.sender.name.charAt(0)}
                        </Avatar>
                      )}
                      
                      <Box
                        sx={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.sender.id === user.id ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {message.sender.id !== user.id && (
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, px: 1 }}>
                            {message.sender.name}
                            {message.sender.role === 'support_agent' && (
                              <Chip
                                label="Support"
                                size="small"
                                color="primary"
                                sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                              />
                            )}
                          </Typography>
                        )}
                        
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            bgcolor: message.sender.id === user.id 
                              ? theme.palette.primary.main 
                              : theme.palette.background.paper,
                            color: message.sender.id === user.id 
                              ? theme.palette.primary.contrastText 
                              : theme.palette.text.primary,
                            borderRadius: 2,
                            position: 'relative',
                            '&:hover .message-actions': {
                              opacity: 1
                            }
                          }}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setSelectedMessage(message);
                            setAnchorEl(e.currentTarget);
                          }}
                        >
                          {message.reply_to && (
                            <Box
                              sx={{
                                p: 1,
                                mb: 1,
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                borderRadius: 1,
                                borderLeft: 3,
                                borderColor: theme.palette.primary.main
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                Replying to {message.reply_to.sender.name}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {message.reply_to.content.length > 50 
                                  ? `${message.reply_to.content.substring(0, 50)}...`
                                  : message.reply_to.content
                                }
                              </Typography>
                            </Box>
                          )}
                          
                          {message.type === MESSAGE_TYPES.text && (
                            <Typography variant="body2">
                              {message.content}
                            </Typography>
                          )}
                          
                          {message.type === MESSAGE_TYPES.image && (
                            <Box>
                              <img
                                src={message.file_url}
                                alt={message.content}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: 200,
                                  borderRadius: 8
                                }}
                              />
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                {message.content}
                              </Typography>
                            </Box>
                          )}
                          
                          {message.type === MESSAGE_TYPES.file && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getFileIcon(message.file_type)}
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {message.content}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatFileSize(message.file_size)}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                href={message.file_url}
                                target="_blank"
                                download
                              >
                                <FileIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                          
                          {message.type === MESSAGE_TYPES.system && (
                            <Typography variant="body2" fontStyle="italic" color="text.secondary">
                              {message.content}
                            </Typography>
                          )}
                          
                          {/* Message Actions */}
                          <Box
                            className="message-actions"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: message.sender.id === user.id ? 'auto' : 8,
                              left: message.sender.id === user.id ? 8 : 'auto',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              display: 'flex',
                              gap: 0.5,
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              p: 0.5,
                              boxShadow: 1
                            }}
                          >
                            <Tooltip title="Reply">
                              <IconButton
                                size="small"
                                onClick={() => setReplyingTo(message)}
                              >
                                <ReplyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="React">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setSelectedMessage(message);
                                  setAnchorEl(e.currentTarget);
                                }}
                              >
                                <EmojiIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          
                          {/* Reactions */}
                          {message.reactions && Object.keys(message.reactions).length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                              {Object.entries(message.reactions).map(([emoji, users]) => (
                                <Chip
                                  key={emoji}
                                  label={`${emoji} ${users.length}`}
                                  size="small"
                                  variant={users.some(u => u.id === user.id) ? "filled" : "outlined"}
                                  onClick={() => addReaction(message.id, emoji)}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                          )}
                        </Paper>
                        
                        {settings.showTimestamps && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1 }}>
                            {formatTime(message.timestamp)}
                            {message.sender.id === user.id && message.read && (
                              <CheckCircleIcon sx={{ fontSize: 12, ml: 0.5, color: 'success.main' }} />
                            )}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Zoom>
                ))
              )}
              
              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <Fade in={true}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }}>
                      <Typography variant="caption">...</Typography>
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {typingUsers.map(u => u.name).join(', ')} 
                      {typingUsers.length === 1 ? ' is' : ' are'} typing...
                    </Typography>
                  </Box>
                </Fade>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Reply Bar */}
            {replyingTo && (
              <Slide direction="up" in={true}>
                <Box
                  sx={{
                    p: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="primary">
                      Replying to {replyingTo.sender.name}
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {replyingTo.content}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setReplyingTo(null)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Slide>
            )}

            {/* Upload Progress */}
            {uploading && (
              <Box sx={{ p: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption" color="text.secondary">
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}

            {/* Message Input */}
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                
                <Tooltip title="Attach File">
                  <IconButton
                    color="primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <AttachIcon />
                  </IconButton>
                </Tooltip>
                
                <TextField
                  ref={chatInputRef}
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && settings.enterToSend) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3
                    }
                  }}
                />
                
                <Tooltip title="Send Message">
                  <IconButton
                    color="primary"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || uploading}
                    sx={{ borderRadius: 2 }}
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Context Menu for Messages */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setReplyingTo(selectedMessage)}>
            <ListItemIcon><ReplyIcon fontSize="small" /></ListItemIcon>
            Reply
          </MenuItem>
          <Divider />
          {EMOJI_REACTIONS.map((emoji) => (
            <MenuItem
              key={emoji}
              onClick={() => {
                addReaction(selectedMessage?.id, emoji);
                setAnchorEl(null);
              }}
            >
              {emoji}
            </MenuItem>
          ))}
        </Menu>

        {/* Settings Dialog */}
        <Dialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                  />
                }
                label="Enable Notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.sounds}
                    onChange={(e) => setSettings(prev => ({ ...prev, sounds: e.target.checked }))}
                  />
                }
                label="Notification Sounds"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enterToSend}
                    onChange={(e) => setSettings(prev => ({ ...prev, enterToSend: e.target.checked }))}
                  />
                }
                label="Enter to Send Messages"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.showTimestamps}
                    onChange={(e) => setSettings(prev => ({ ...prev, showTimestamps: e.target.checked }))}
                  />
                }
                label="Show Message Timestamps"
              />
              
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={settings.status}
                  label="Status"
                  onChange={(e) => updateUserStatus(e.target.value)}
                >
                  {Object.entries(USER_STATUS).map(([key, config]) => (
                    <MenuItem key={key} value={key}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {config.icon}
                        {config.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSettings(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Slide>
  );
};

export default LiveChatSystem;