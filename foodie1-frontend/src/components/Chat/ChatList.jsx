import React, { useState, useEffect } from 'react';
import { 
    List, 
    ListItem, 
    ListItemAvatar, 
    ListItemText, 
    Avatar, 
    Typography, 
    Paper, 
    Box,
    Divider,
    Badge,
    IconButton
} from '@mui/material';
import { Chat as ChatIcon, MoreVert } from '@mui/icons-material';
import { chatService } from '../../service/chatService';
import { toast } from 'react-toastify';

const ChatList = ({ onSelectChat, selectedChatId }) => {
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user);
        if (user) {
            loadChatList();
        }
    }, []);

    const loadChatList = async () => {
        setLoading(true);
        try {
            // Lấy danh sách tin nhắn chưa đọc để hiển thị
            const unreadMessages = await chatService.getUnreadMessages();
            
            // Tạo danh sách chat unique dựa trên sender
            const uniqueChats = new Map();
            
            unreadMessages.forEach(message => {
                const senderId = message.senderId;
                if (!uniqueChats.has(senderId)) {
                    uniqueChats.set(senderId, {
                        id: senderId,
                        name: message.senderName,
                        avatar: message.senderAvatar,
                        lastMessage: message.content,
                        timestamp: message.timestamp,
                        unreadCount: 1
                    });
                } else {
                    const chat = uniqueChats.get(senderId);
                    chat.unreadCount++;
                    if (new Date(message.timestamp) > new Date(chat.timestamp)) {
                        chat.lastMessage = message.content;
                        chat.timestamp = message.timestamp;
                    }
                }
            });
            
            // Sắp xếp theo thời gian mới nhất
            const sortedChats = Array.from(uniqueChats.values())
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            setChatList(sortedChats);
        } catch (error) {
            toast.error('Không thể tải danh sách chat');
        } finally {
            setLoading(false);
        }
    };

    const handleChatSelect = (chatId) => {
        onSelectChat(chatId);
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffInHours < 48) {
            return 'Hôm qua';
        } else {
            return date.toLocaleDateString('vi-VN');
        }
    };

    if (loading) {
        return (
            <Paper sx={{ p: 2, minHeight: 200 }}>
                <Typography>Đang tải...</Typography>
            </Paper>
        );
    }

    if (chatList.length === 0) {
        return (
            <Paper sx={{ p: 2, minHeight: 200, textAlign: 'center' }}>
                <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Chưa có cuộc trò chuyện nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Bắt đầu chat với ai đó để xem cuộc trò chuyện ở đây
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ minHeight: 400 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Tin nhắn</Typography>
            </Box>
            <List sx={{ p: 0 }}>
                {chatList.map((chat, index) => (
                    <React.Fragment key={chat.id}>
                        <ListItem
                            button
                            selected={selectedChatId === chat.id}
                            onClick={() => handleChatSelect(chat.id)}
                            sx={{
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                },
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    '&:hover': {
                                        bgcolor: 'primary.light'
                                    }
                                }
                            }}
                        >
                            <ListItemAvatar>
                                <Badge
                                    badgeContent={chat.unreadCount}
                                    color="error"
                                    max={99}
                                >
                                    <Avatar src={chat.avatar}>
                                        {chat.name?.charAt(0)}
                                    </Avatar>
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2" component="span">
                                            {chat.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatTimestamp(chat.timestamp)}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 200
                                        }}
                                    >
                                        {chat.lastMessage}
                                    </Typography>
                                }
                            />
                            <IconButton size="small">
                                <MoreVert />
                            </IconButton>
                        </ListItem>
                        {index < chatList.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default ChatList;
