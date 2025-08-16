import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Paper, 
    Typography, 
    Container, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar, 
    Avatar, 
    Badge, 
    Divider,
    Fade,
    useTheme
} from '@mui/material';
import { Chat as ChatIcon, Person as PersonIcon } from '@mui/icons-material';
import Chat from '../../../components/Chat';
import { chatService } from '../../../service/chatService';
import { toast } from 'react-toastify';

const AdminChatPage = () => {
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [selectedChatInfo, setSelectedChatInfo] = useState(null);
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        loadChatList();
        
        // Cập nhật danh sách chat mỗi 30 giây
        const interval = setInterval(() => {
            if (!loading) {
                loadChatList();
            }
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const loadChatList = async () => {
        try {
            setLoading(true);
            
            // Lấy danh sách chat conversations thực tế
            console.log('Attempting to load chat conversations from backend...');
            const chatConversations = await chatService.getChatConversations();
            
            if (chatConversations && chatConversations.length > 0) {
                // Xử lý danh sách chat conversations từ backend
                const processedChats = chatConversations.map(chat => ({
                    id: chat.userId || chat.id,
                    name: chat.userName || chat.name || 'User',
                    avatar: chat.userAvatar || chat.avatar || '/user-avatar.jpg',
                    lastMessage: chat.lastMessage || chat.content || 'Chưa có tin nhắn',
                    timestamp: chat.lastMessageTime || chat.timestamp || new Date(),
                    unreadCount: chat.unreadCount || 0,
                    conversationId: chat.conversationId || chat.id
                }));
                
                // Sắp xếp theo thời gian gần nhất
                processedChats.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                setChatList(processedChats);
                console.log('Successfully loaded real chat conversations from backend:', processedChats);
                return; // Thoát sớm nếu thành công
            } else {
                console.log('No conversations found, trying recent messages...');
            }
            
            // Fallback: tạo danh sách mẫu dựa trên tin nhắn thực tế
            try {
                console.log('Attempting to load recent messages...');
                const recentMessages = await chatService.getRecentMessages();
                if (recentMessages && recentMessages.length > 0) {
                    // Tạo danh sách unique users từ tin nhắn gần đây
                    const uniqueUsers = new Map();
                    recentMessages.forEach(message => {
                        if (message.senderId !== '1') { // Không phải admin
                            const userId = message.senderId;
                            if (!uniqueUsers.has(userId)) {
                                uniqueUsers.set(userId, {
                                    id: userId,
                                    name: message.senderName || `User ${userId}`,
                                    avatar: message.senderAvatar || '/user-avatar.jpg',
                                    lastMessage: message.content,
                                    timestamp: message.timestamp,
                                    unreadCount: 0, // Không còn hiển thị unread count
                                    conversationId: `conv_${userId}`
                                });
                            } else {
                                // Cập nhật tin nhắn cuối cùng
                                const existing = uniqueUsers.get(userId);
                                if (new Date(message.timestamp) > new Date(existing.timestamp)) {
                                    existing.lastMessage = message.content;
                                    existing.timestamp = message.timestamp;
                                }
                            }
                        }
                    });
                    
                    if (uniqueUsers.size > 0) {
                        const userList = Array.from(uniqueUsers.values());
                        // Sắp xếp theo thời gian gần nhất
                        userList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                        setChatList(userList);
                        console.log('Successfully created chat list from recent messages:', userList);
                        return; // Thoát sớm nếu thành công
                    }
                }
            } catch (error) {
                console.error('Error loading recent messages:', error);
            }
            
            // Nếu tất cả đều thất bại, sử dụng sample data
            console.log('All backend calls failed, using sample data...');
            createSampleChatList();
            
        } catch (error) {
            console.error('Error loading chat conversations:', error);
            console.log('Falling back to sample data...');
            createSampleChatList();
        } finally {
            setLoading(false);
        }
    };

    const createSampleChatList = () => {
        const sampleUsers = [
            { 
                id: '2', 
                name: 'Nguyễn Văn A', 
                avatar: '/user-avatar.jpg', 
                lastMessage: 'Chào admin! Tôi cần hỗ trợ về đơn hàng #12345', 
                timestamp: new Date(Date.now() - 300000), // 5 phút trước
                unreadCount: 0,
                conversationId: 'conv_2'
            },
            { 
                id: '3', 
                name: 'Trần Thị B', 
                avatar: '/user-avatar.jpg', 
                lastMessage: 'Cảm ơn admin đã hỗ trợ! Đơn hàng đã được xử lý', 
                timestamp: new Date(Date.now() - 1800000), // 30 phút trước
                unreadCount: 0,
                conversationId: 'conv_3'
            },
            { 
                id: '4', 
                name: 'Lê Văn C', 
                avatar: '/user-avatar.jpg', 
                lastMessage: 'Tôi có câu hỏi về menu mới, có thể tư vấn giúp không?', 
                timestamp: new Date(Date.now() - 3600000), // 1 giờ trước
                unreadCount: 0,
                conversationId: 'conv_4'
            },
            { 
                id: '5', 
                name: 'Phạm Thị D', 
                avatar: '/user-avatar.jpg', 
                lastMessage: 'Xin chào! Tôi muốn đặt bàn cho tối nay', 
                timestamp: new Date(Date.now() - 7200000), // 2 giờ trước
                unreadCount: 0,
                conversationId: 'conv_5'
            }
        ];
        
        // Sắp xếp theo thời gian gần nhất lên đầu
        sampleUsers.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setChatList(sampleUsers);
        console.log('Created sample chat list:', sampleUsers);
    };

    const handleChatSelect = (chatId) => {
        setSelectedChatId(chatId);
        const chatInfo = chatList.find(chat => chat.id === chatId);
        if (chatInfo) {
            setSelectedChatInfo(chatInfo);
        }
    };

    const handleChatClose = () => {
        setSelectedChatId(null);
        setSelectedChatInfo(null);
    };

    const formatTimestamp = (timestamp) => {
        const now = new Date();
        const messageTime = new Date(timestamp);

        const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);

        if (diffMinutes < 1) {
            return 'Vừa xong';
        } else if (diffMinutes < 60) {
            return `${Math.floor(diffMinutes)} phút trước`;
        } else if (diffMinutes < 1440) { // 24 hours
            return `${Math.floor(diffMinutes / 60)} giờ trước`;
        } else {
            return messageTime.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4, p: 0 }}>
            <Fade in={true} timeout={500}>
                <Box sx={{ height: '90vh', position: 'relative' }}>
                    {/* Background Pattern */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                            radial-gradient(circle at 20% 80%, ${theme.palette.primary.main}15 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, ${theme.palette.primary.dark}15 0%, transparent 50%),
                            radial-gradient(circle at 40% 40%, ${theme.palette.primary.main}10 0%, transparent 50%)
                        `,
                        borderRadius: 4
                    }} />

                    <Grid container spacing={3} sx={{ height: '100%', position: 'relative', zIndex: 2 }}>
                        {/* Danh sách chat */}
                        <Grid item xs={12} md={4}>
                            <Paper 
                                elevation={8}
                                sx={{ 
                                    p: 3, 
                                    height: '100%', 
                                    overflow: 'auto',
                                    borderRadius: 3,
                                    background: theme.palette.mode === 'dark' 
                                        ? 'rgba(29,29,29,0.95)' 
                                        : 'rgba(255,255,255,0.95)',
                                    backdropFilter: 'blur(20px)',
                                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
                                    boxShadow: `0 8px 32px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
                                    '&::-webkit-scrollbar': {
                                        width: '12px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f1f1f1',
                                        borderRadius: '6px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background: theme.palette.mode === 'dark' ? theme.palette.grey[600] : '#c1c1c1',
                                        borderRadius: '6px',
                                        '&:hover': {
                                            background: theme.palette.mode === 'dark' ? theme.palette.grey[500] : '#a8a8a8',
                                        },
                                    },
                                    scrollBehavior: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: theme.palette.mode === 'dark' 
                                        ? `${theme.palette.grey[600]} ${theme.palette.grey[800]}` 
                                        : '#c1c1c1 #f1f1f1',
                                    // Cải thiện scroll behavior
                                    overscrollBehavior: 'contain',
                                    scrollSnapType: 'none'
                                }}
                            >
                                <Typography 
                                    variant="h5" 
                                    gutterBottom 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        mb: 3,
                                        fontWeight: 700,
                                        color: 'text.primary',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    <ChatIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                                    Danh sách chat
                                </Typography>

                                {loading ? (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">Đang tải...</Typography>
                                    </Box>
                                ) : chatList.length === 0 ? (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                                        <Typography variant="body1" color="text.secondary" gutterBottom>
                                            Chưa có cuộc trò chuyện nào
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Khi user chat với admin, cuộc trò chuyện sẽ xuất hiện ở đây
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List sx={{ 
                                        p: 0,
                                        '& .MuiListItem-root': {
                                            scrollMarginTop: '8px',
                                            scrollMarginBottom: '8px'
                                        }
                                    }}>
                                        {chatList.map((chat) => (
                                            <React.Fragment key={chat.id}>
                                                <ListItem
                                                    button
                                                    onClick={() => handleChatSelect(chat.id)}
                                                    selected={selectedChatId === chat.id}
                                                    sx={{
                                                        borderRadius: 2,
                                                        mb: 1,
                                                        p: 2,
                                                        transition: 'all 0.3s ease',
                                                        scrollBehavior: 'smooth',
                                                        '&:hover': { 
                                                            bgcolor: theme.palette.mode === 'dark' 
                                                                ? 'rgba(118, 75, 162, 0.2)' 
                                                                : 'rgba(102, 126, 234, 0.1)',
                                                            transform: 'translateX(5px)'
                                                        },
                                                        '&.Mui-selected': { 
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                            color: 'white',
                                                            boxShadow: `0 4px 20px ${theme.palette.primary.main}40`
                                                        }
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Box sx={{ position: 'relative' }}>
                                                            <Avatar 
                                                                src={chat.avatar}
                                                                sx={{ 
                                                                    width: 50, 
                                                                    height: 50,
                                                                    bgcolor: theme.palette.mode === 'dark' 
                                                                        ? 'rgba(118, 75, 162, 0.3)' 
                                                                        : 'rgba(102, 126, 234, 0.2)',
                                                                    border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(118, 75, 162, 0.4)' : 'rgba(102, 126, 234, 0.3)'}`
                                                                }}
                                                            >
                                                                <PersonIcon />
                                                            </Avatar>
                                                            {/* Online status indicator */}
                                                            <Box sx={{
                                                                position: 'absolute',
                                                                bottom: 2,
                                                                right: 2,
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                bgcolor: '#4CAF50',
                                                                border: `2px solid ${theme.palette.background.paper}`,
                                                                boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)'
                                                            }} />
                                                        </Box>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                <Typography variant="subtitle1" fontWeight="600">
                                                                    {chat.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {formatTimestamp(chat.timestamp)}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box component="span">
                                                                {/* Last message */}
                                                                <Box component="span" sx={{ 
                                                                    display: 'block',
                                                                    color: 'text.secondary',
                                                                    fontSize: '0.875rem',
                                                                    mb: 0.5,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    maxWidth: '200px'
                                                                }}>
                                                                    {chat.lastMessage}
                                                                </Box>
                                                                {/* User info and badges */}
                                                                <Box component="span" sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    flexWrap: 'wrap'
                                                                }}>
                                                                    {/* User ID */}
                                                                    <Box component="span" sx={{
                                                                        fontSize: '0.7rem',
                                                                        color: 'text.secondary',
                                                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                                                        px: 1,
                                                                        py: 0.25,
                                                                        borderRadius: 1,
                                                                        fontFamily: 'monospace',
                                                                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                                                                    }}>
                                                                        #{chat.id}
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                                <Divider sx={{ opacity: theme.palette.mode === 'dark' ? 0.1 : 0.3 }} />
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        </Grid>

                        {/* Chat window */}
                        <Grid item xs={12} md={8}>
                            {selectedChatId ? (
                                <Paper 
                                    elevation={24}
                                    sx={{ 
                                        height: '100%',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                        border: 'none',
                                        position: 'relative',
                                        boxShadow: `0 20px 60px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)'}`
                                    }}
                                >
                                    {/* Chat Header */}
                                    <Box 
                                        sx={{ 
                                            p: 3, 
                                            background: theme.palette.mode === 'dark' 
                                                ? 'rgba(0,0,0,0.3)' 
                                                : 'rgba(255,255,255,0.1)',
                                            backdropFilter: 'blur(20px)',
                                            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 3
                                        }}
                                    >
                                        <Avatar 
                                            src={selectedChatInfo?.avatar}
                                            sx={{ 
                                                width: 50, 
                                                height: 50,
                                                bgcolor: theme.palette.mode === 'dark' 
                                                    ? 'rgba(0,0,0,0.3)' 
                                                    : 'rgba(255,255,255,0.2)',
                                                border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'}`,
                                                boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'}`
                                            }}
                                        >
                                            <PersonIcon sx={{ color: 'white', fontSize: 28 }} />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight="700" color="white" gutterBottom>
                                                {selectedChatInfo?.name || 'User'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{ 
                                                    width: 8, 
                                                    height: 8, 
                                                    borderRadius: '50%', 
                                                    bgcolor: '#4CAF50',
                                                    boxShadow: '0 0 10px #4CAF50'
                                                }} />
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                                    Đang hoạt động • Phản hồi nhanh
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Chat Messages */}
                                    <Box sx={{ 
                                        flex: 1, 
                                        overflow: 'auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        bgcolor: theme.palette.background.paper,
                                        height: 'calc(100% - 120px)',
                                        // Cải thiện scroll behavior
                                        scrollBehavior: 'auto',
                                        overscrollBehavior: 'contain',
                                        scrollSnapType: 'none',
                                        '&::-webkit-scrollbar': {
                                            width: '12px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#f1f1f1',
                                            borderRadius: '6px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: theme.palette.mode === 'dark' ? theme.palette.grey[600] : '#c1c1c1',
                                            borderRadius: '6px',
                                            '&:hover': {
                                                background: theme.palette.mode === 'dark' ? theme.palette.grey[500] : '#a8a8a8',
                                            },
                                        },
                                        scrollbarWidth: 'thin',
                                        scrollbarColor: theme.palette.mode === 'dark' 
                                            ? `${theme.palette.grey[600]} ${theme.palette.grey[800]}` 
                                            : '#c1c1c1 #f1f1f1'
                                    }}>
                                        <Chat
                                            isOpen={true}
                                            onClose={handleChatClose}
                                            receiverId={selectedChatId}
                                            receiverName={selectedChatInfo?.name || 'User'}
                                            receiverAvatar={selectedChatInfo?.avatar}
                                            isInline={true}
                                        />
                                    </Box>
                                </Paper>
                            ) : (
                                <Paper 
                                    elevation={8}
                                    sx={{ 
                                        p: 6, 
                                        textAlign: 'center', 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        borderRadius: 3,
                                        background: theme.palette.mode === 'dark' 
                                            ? 'rgba(29,29,29,0.95)' 
                                            : 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(20px)',
                                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
                                        boxShadow: `0 8px 32px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`
                                    }}
                                >
                                    <Box sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3,
                                        boxShadow: `0 8px 25px ${theme.palette.primary.main}40`
                                    }}>
                                        <ChatIcon sx={{ fontSize: 40, color: 'white' }} />
                                    </Box>
                                    <Typography variant="h5" color="text.primary" gutterBottom fontWeight="600">
                                        Chọn một cuộc trò chuyện để bắt đầu chat
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
                                        Admin có thể chat với user để hỗ trợ và giải đáp thắc mắc
                                    </Typography>
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
        </Container>
    );
};

export default AdminChatPage;
