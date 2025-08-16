import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, TextField, Button, Avatar, List, ListItem, ListItemText, ListItemAvatar, IconButton, Badge, useTheme } from '@mui/material';
import { Send, Chat as ChatIcon, Close } from '@mui/icons-material';
import { chatService } from '../../service/chatService';
import { toast } from 'react-toastify';
import { Client } from '@stomp/stompjs';
import { getWebSocketURL, WEBSOCKET_CONFIG } from '../../configs/websocket.config';

const Chat = ({ isOpen, onClose, receiverId, receiverName, receiverAvatar, isInline = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const [currentUser, setCurrentUser] = useState(null);
    const theme = useTheme();

    // Helper function để disconnect WebSocket một cách an toàn
    const disconnectWebSocket = () => {
        if (stompClient) {
            console.log('Disconnecting WebSocket client:', stompClient);
            try {
                if (stompClient.connected) {
                    console.log('Client is connected, deactivating...');
                    stompClient.deactivate();
                } else {
                    console.log('Client is not connected, skipping deactivation');
                }
            } catch (error) {
                console.warn('Error disconnecting WebSocket:', error);
            }
            setStompClient(null);
            setIsConnected(false);
        } else {
            console.log('No WebSocket client to disconnect');
        }
    };

    useEffect(() => {
        // Lấy thông tin user hiện tại từ localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Current user from localStorage:', user);
        setCurrentUser(user);

        if (user && receiverId) {
            console.log('Loading messages for user:', user.id, 'receiver:', receiverId);
            console.log('Current stompClient state:', stompClient);
            
            // Disconnect WebSocket cũ trước khi tạo mới
            disconnectWebSocket();
            
            // Kết nối WebSocket mới
            connectWebSocket(user.id);
            // Lấy tin nhắn cũ
            loadMessages(user.id, receiverId);
        } else {
            console.log('Missing user or receiverId:', { user, receiverId });
            
            // Fallback: tạo user mẫu và tin nhắn mẫu để test
            const mockUser = { id: '2', name: 'Test User', username: 'testuser' };
            setCurrentUser(mockUser);
            
            // Không cần tin nhắn mẫu nữa vì đã có tin nhắn thực tế
            console.log('No sample messages needed - using real messages from API');
        }

        return () => {
            // Cleanup function - disconnect WebSocket khi component unmount hoặc receiverId thay đổi
            console.log('useEffect cleanup triggered for receiverId:', receiverId);
            disconnectWebSocket();
        };
    }, [receiverId, currentUser?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cleanup WebSocket khi component unmount
    useEffect(() => {
        return () => {
            disconnectWebSocket();
        };
    }, [stompClient]);

    const connectWebSocket = (userId) => {
        // Disconnect client cũ nếu có
        disconnectWebSocket();
        
        // Sử dụng cấu hình WebSocket từ config
        const wsUrl = getWebSocketURL();
        console.log('Connecting to WebSocket:', wsUrl);
        
        const client = new Client({
            brokerURL: wsUrl,
            debug: WEBSOCKET_CONFIG.debug,
            reconnectDelay: WEBSOCKET_CONFIG.reconnectDelay,
            heartbeatIncoming: WEBSOCKET_CONFIG.heartbeatIncoming,
            heartbeatOutgoing: WEBSOCKET_CONFIG.heartbeatOutgoing,
        });

        client.onConnect = (frame) => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            
            // Subscribe vào queue messages của user (chỉ cần 1 subscription)
            client.subscribe(`/user/${userId}/queue/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log('Received message via WebSocket:', receivedMessage);
                
                // Chỉ thêm tin nhắn nếu không phải từ chính mình và chưa có trong danh sách
                if (receivedMessage.senderId !== userId.toString()) {
                    setMessages(prev => {
                        // Kiểm tra xem tin nhắn đã tồn tại chưa để tránh duplicate
                        const messageExists = prev.some(msg => 
                            msg.id === receivedMessage.id || 
                            (msg.content === receivedMessage.content && 
                             msg.senderId === receivedMessage.senderId && 
                             msg.timestamp === receivedMessage.timestamp)
                        );
                        
                        if (!messageExists) {
                            return [...prev, receivedMessage];
                        } else {
                            console.log('Message already exists, skipping duplicate:', receivedMessage);
                            return prev;
                        }
                    });
                } else {
                    console.log('Skipping own message from WebSocket');
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
            setIsConnected(false);
        };

        client.onWebSocketError = (error) => {
            console.error('WebSocket error:', error);
            setIsConnected(false);
        };

        client.onWebSocketClose = () => {
            console.log('WebSocket connection closed');
            setIsConnected(false);
        };

        try {
            client.activate();
            setStompClient(client);
        } catch (error) {
            console.error('Error activating WebSocket client:', error);
            setIsConnected(false);
        }
    };

    const loadMessages = async (userId1, userId2) => {
        try {
            console.log('Loading messages between users:', userId1, userId2);
            const response = await chatService.getMessagesBetweenUsers(userId1, userId2);
            console.log('Messages response:', response);
            
            if (response && response.length > 0) {
                // Đảm bảo tin nhắn có đầy đủ thông tin
                const processedMessages = response.map(msg => ({
                    ...msg,
                    senderId: msg.senderId?.toString() || msg.senderId,
                    receiverId: msg.receiverId?.toString() || msg.receiverId,
                    timestamp: msg.timestamp || new Date().toISOString(),
                    senderName: msg.senderName || (msg.senderId === '1' ? 'Admin Hỗ Trợ' : 'User'),
                    content: msg.content || 'Tin nhắn trống'
                }));
                setMessages(processedMessages);
                console.log('Processed messages:', processedMessages);
            } else {
                // Thêm tin nhắn mẫu để test scroll
                const sampleMessages = [
                    {
                        id: 'sample1',
                        content: 'Chào bạn! Cần hỗ trợ gì không?',
                        senderId: '1',
                        receiverId: userId1.toString(),
                        senderName: 'Admin Hỗ Trợ',
                        senderAvatar: null,
                        messageType: 'TEXT',
                        messageStatus: 'SENT',
                        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 giờ trước
                    },
                    {
                        id: 'sample2',
                        content: 'Chào admin! Tôi cần hỗ trợ về đơn hàng',
                        senderId: userId1.toString(),
                        receiverId: '1',
                        senderName: currentUser?.name || 'Bạn',
                        senderAvatar: currentUser?.avatar,
                        messageType: 'TEXT',
                        messageStatus: 'SENT',
                        timestamp: new Date(Date.now() - 1800000).toISOString() // 30 phút trước
                    },
                    {
                        id: 'sample3',
                        content: 'Bạn có thể cho tôi biết mã đơn hàng không?',
                        senderId: '1',
                        receiverId: userId1.toString(),
                        senderName: 'Admin Hỗ Trợ',
                        senderAvatar: null,
                        messageType: 'TEXT',
                        messageStatus: 'SENT',
                        timestamp: new Date(Date.now() - 900000).toISOString() // 15 phút trước
                    },
                    {
                        id: 'sample4',
                        content: 'Mã đơn hàng của tôi là: ORD-2024-001',
                        senderId: userId1.toString(),
                        receiverId: '1',
                        senderName: currentUser?.name || 'Bạn',
                        senderAvatar: currentUser?.avatar,
                        messageType: 'TEXT',
                        messageStatus: 'SENT',
                        timestamp: new Date(Date.now() - 600000).toISOString() // 10 phút trước
                    },
                    {
                        id: 'sample5',
                        content: 'Cảm ơn bạn! Tôi sẽ kiểm tra đơn hàng ngay',
                        senderId: '1',
                        receiverId: userId1.toString(),
                        senderName: 'Admin Hỗ Trợ',
                        senderAvatar: null,
                        messageType: 'TEXT',
                        messageStatus: 'SENT',
                        timestamp: new Date(Date.now() - 300000).toISOString() // 5 phút trước
                    }
                ];
                setMessages(sampleMessages);
                console.log('Set sample messages for testing:', sampleMessages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Không thể tải tin nhắn');
            
            // Fallback: sử dụng tin nhắn mẫu
            const fallbackMessages = [
                {
                    id: 'fallback1',
                    content: 'Chào bạn! Cần hỗ trợ gì không?',
                    senderId: '1',
                    receiverId: userId1.toString(),
                    senderName: 'Admin Hỗ Trợ',
                    senderAvatar: null,
                    messageType: 'TEXT',
                    messageStatus: 'SENT',
                    timestamp: new Date(Date.now() - 3600000).toISOString()
                }
            ];
            setMessages(fallbackMessages);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !currentUser || !receiverId) return;

        const messageData = {
            content: newMessage.trim(),
            receiverId: receiverId.toString(),
            messageType: 'TEXT',
            roomId: null
        };

        // Tạo tin nhắn local để hiển thị ngay lập tức
        const localMessage = {
            id: `local_${Date.now()}`, // ID tạm thời với prefix
            content: newMessage.trim(),
            senderId: currentUser.id.toString(),
            receiverId: receiverId.toString(),
            senderName: currentUser.name || currentUser.username || 'Bạn',
            senderAvatar: currentUser.avatar,
            messageType: 'TEXT',
            messageStatus: 'SENT',
            timestamp: new Date().toISOString(),
            roomId: null
        };

        console.log('Sending local message:', localMessage);

        // Thêm tin nhắn vào state ngay lập tức (tránh duplicate)
        setMessages(prev => {
            const newMessages = [...prev, localMessage];
            console.log('Updated messages state:', newMessages);
            return newMessages;
        });
        setNewMessage('');

        try {
            if (stompClient && isConnected) {
                // Gửi qua WebSocket với user ID
                const wsMessageData = {
                    ...messageData,
                    senderId: currentUser.id.toString() // Thêm senderId
                };
                stompClient.publish({
                    destination: '/app/send-message',
                    body: JSON.stringify(wsMessageData)
                });
                console.log('Message sent via WebSocket:', wsMessageData);
                
                // Không cần thêm tin nhắn từ WebSocket response vì đã có local message
            } else {
                // Fallback: gửi qua REST API
                const response = await chatService.sendMessage(messageData);
                console.log('Message sent via REST API:', response);
                
                // Cập nhật tin nhắn local với response từ server
                if (response && response.id) {
                    setMessages(prev => prev.map(msg => 
                        msg.id === localMessage.id ? { ...response, senderName: localMessage.senderName } : msg
                    ));
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Không thể gửi tin nhắn');
            // Xóa tin nhắn local nếu gửi thất bại
            setMessages(prev => prev.filter(msg => msg.id !== localMessage.id));
        }
    };

    const scrollToBottom = () => {
        const messagesContainer = document.querySelector('[data-testid="messages-container"]');
        if (messagesContainer && messagesEndRef.current) {
            // Kiểm tra xem user có đang scroll không
            const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            
            // Chỉ scroll to bottom nếu user đang ở gần cuối
            if (isNearBottom) {
                messagesEndRef.current.scrollIntoView({ 
                    behavior: 'auto',
                    block: 'end',
                    inline: 'nearest'
                });
                console.log('Scrolled to bottom');
            } else {
                console.log('User not near bottom, skipping auto-scroll');
            }
        }
    };

    const scrollToTop = () => {
        const messagesContainer = document.querySelector('[data-testid="messages-container"]') || 
                                document.querySelector('.MuiBox-root[style*="overflow: auto"]');
        if (messagesContainer) {
            messagesContainer.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const scrollToMessage = (messageIndex) => {
        const messagesContainer = document.querySelector('[data-testid="messages-container"]') || 
                                document.querySelector('.MuiBox-root[style*="overflow: auto"]');
        if (messagesContainer) {
            const messageElements = messagesContainer.querySelectorAll('[data-message-index]');
            if (messageElements[messageIndex]) {
                messageElements[messageIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
        
        // Keyboard shortcuts cho scroll
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Home':
                    e.preventDefault();
                    scrollToTop();
                    break;
                case 'End':
                    e.preventDefault();
                    scrollToBottom();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const messagesContainer = document.querySelector('[data-testid="messages-container"]');
                    if (messagesContainer) {
                        messagesContainer.scrollBy({
                            top: -100,
                            behavior: 'smooth'
                        });
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    const messagesContainerDown = document.querySelector('[data-testid="messages-container"]');
                    if (messagesContainerDown) {
                        messagesContainerDown.scrollBy({
                            top: 100,
                            behavior: 'smooth'
                        });
                    }
                    break;
                default:
                    break;
            }
        }
    };

    // Thêm event listener cho scroll
    useEffect(() => {
        const messagesContainer = document.querySelector('[data-testid="messages-container"]');
        
        if (messagesContainer) {
            console.log('Messages container found:', messagesContainer);
            console.log('Container scrollHeight:', messagesContainer.scrollHeight);
            console.log('Container clientHeight:', messagesContainer.clientHeight);
            console.log('Container offsetHeight:', messagesContainer.offsetHeight);
            console.log('Can scroll:', messagesContainer.scrollHeight > messagesContainer.clientHeight);
            
            let isUserScrolling = false;
            let scrollTimeout;
            
            const handleScroll = () => {
                // Đánh dấu user đang scroll
                isUserScrolling = true;
                clearTimeout(scrollTimeout);
                
                // Reset flag sau 150ms không scroll
                scrollTimeout = setTimeout(() => {
                    isUserScrolling = false;
                }, 150);
                
                // Auto-scroll to bottom chỉ khi user scroll gần cuối và không phải đang scroll
                const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
                const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
                
                console.log('Scroll info:', { scrollTop, scrollHeight, clientHeight, isNearBottom, isUserScrolling });
                
                // Chỉ auto-scroll khi user ở gần cuối và không đang scroll
                if (isNearBottom && messages.length > 0 && !isUserScrolling) {
                    setTimeout(() => scrollToBottom(), 100);
                }
            };
            
            messagesContainer.addEventListener('scroll', handleScroll);
            
            // Force scroll to bottom chỉ khi component mount lần đầu
            if (messages.length > 0) {
                setTimeout(() => {
                    if (!isUserScrolling) {
                        scrollToBottom();
                        console.log('Initial scroll to bottom');
                    }
                }, 100);
            }
            
            return () => {
                messagesContainer.removeEventListener('scroll', handleScroll);
                clearTimeout(scrollTimeout);
            };
        } else {
            console.error('Messages container not found!');
        }
    }, [messages.length]);

    // Debug: Log khi messages thay đổi
    useEffect(() => {
        console.log('Messages updated:', messages);
        console.log('Messages count:', messages.length);
        console.log('Current user:', currentUser);
        console.log('Is connected:', isConnected);
        console.log('New message value:', newMessage);
    }, [messages, currentUser, isConnected, newMessage]);

    // Force re-render khi theme thay đổi để đảm bảo tin nhắn hiển thị đúng
    useEffect(() => {
        console.log('Theme changed:', theme.palette.mode);
        // Force re-render khi theme thay đổi
        setMessages(prev => [...prev]);
    }, [theme.palette.mode]);

    // Đảm bảo tin nhắn được hiển thị đúng khi component mount
    useEffect(() => {
        if (messages.length > 0) {
            console.log('Component mounted with messages:', messages);
            // Force scroll to bottom sau khi render
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, []);

    if (!isOpen) return null;

    console.log('Chat component rendering with props:', {
        isOpen,
        isInline,
        receiverId,
        receiverName,
        messagesCount: messages.length,
        currentUser,
        isConnected,
        newMessage
    });

    // Debug: Kiểm tra xem component có render không
    console.log('Rendering Chat component - should see this in console');

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.paper,
                borderRadius: 0,
                overflow: 'hidden',
                position: 'relative',
                minHeight: '500px', // Đảm bảo có chiều cao tối thiểu
                // Đảm bảo container có thể scroll
                maxHeight: '100vh'
            }}
        >
            {/* Messages */}
            <Box 
                data-testid="messages-container"
                sx={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : 'grey.50',
                    minHeight: '400px',
                    maxHeight: 'calc(100vh - 300px)',
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
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'thin',
                    scrollbarColor: theme.palette.mode === 'dark' 
                        ? `${theme.palette.grey[600]} ${theme.palette.grey[800]}` 
                        : '#c1c1c1 #f1f1f1',
                    // Đảm bảo scroll hoạt động
                    overflowY: 'scroll',
                    overflowX: 'hidden',
                    // CSS quan trọng cho scroll
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <List sx={{ p: 0 }}>
                    {messages.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                            <ChatIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                            <Typography variant="body2">Chưa có tin nhắn nào</Typography>
                            <Typography variant="caption">Bắt đầu cuộc trò chuyện ngay!</Typography>
                        </Box>
                    ) : (
                        <>
                            {/* Debug info */}
                            <Box sx={{ 
                                p: 1, 
                                mb: 2, 
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.2)' : 'lightblue', 
                                borderRadius: 1, 
                                fontSize: '12px',
                                color: theme.palette.text.secondary
                            }}>
                                Tin nhắn: {messages.length} | Có thể scroll: {messages.length > 3 ? 'Có' : 'Không'}
                            </Box>
                            
                            {messages.map((message, index) => {
                                const isOwnMessage = message.senderId === currentUser?.id?.toString();
                                
                                return (
                                    <ListItem
                                        key={index}
                                        data-message-index={index}
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                                            p: 0,
                                            mb: 2
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 0.5
                                        }}>
                                            {!isOwnMessage && (
                                                <Avatar 
                                                    src={message.senderAvatar} 
                                                    sx={{ width: 24, height: 24, mr: 1 }}
                                                >
                                                    {message.senderName?.charAt(0) || 'U'}
                                                </Avatar>
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                                {message.senderName || 'Unknown'}
                                            </Typography>
                                        </Box>
                                        <Paper
                                            elevation={1}
                                            sx={{
                                                p: 1.5,
                                                maxWidth: '80%',
                                                bgcolor: isOwnMessage ? theme.palette.primary.main : theme.palette.background.paper,
                                                color: isOwnMessage ? 'white' : theme.palette.text.primary,
                                                borderRadius: 2,
                                                wordBreak: 'break-word',
                                                border: isOwnMessage ? 'none' : `1px solid ${theme.palette.divider}`
                                            }}
                                        >
                                            <Typography variant="body2">{message.content}</Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </Typography>
                                        </Paper>
                                    </ListItem>
                                );
                            })}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            {/* Input Area - Fixed at bottom */}
            <Box sx={{ 
                p: 2, 
                borderTop: 2, 
                borderColor: theme.palette.primary.main,
                bgcolor: theme.palette.background.paper,
                flexShrink: 0,
                position: 'sticky',
                bottom: 0,
                zIndex: 10,
                minHeight: '120px', // Đảm bảo có chiều cao tối thiểu
                boxShadow: theme.palette.mode === 'dark' 
                    ? '0 -2px 10px rgba(0,0,0,0.3)' 
                    : '0 -2px 10px rgba(0,0,0,0.1)' // Thêm shadow để nổi bật
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    alignItems: 'flex-end'
                }}>
                    <TextField
                        fullWidth
                        size="medium"
                        placeholder="Nhập tin nhắn của bạn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        multiline
                        maxRows={4}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                fontSize: '16px',
                                bgcolor: theme.palette.background.paper,
                                '&:hover fieldset': {
                                    borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.primary.main,
                                    borderWidth: 2,
                                },
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                        size="large"
                        sx={{ 
                            minWidth: '60px',
                            height: '56px',
                            borderRadius: 2,
                            bgcolor: theme.palette.primary.main,
                            '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                                transform: 'scale(1.05)',
                            },
                            '&:disabled': {
                                bgcolor: theme.palette.action.disabledBackground,
                                color: theme.palette.action.disabled,
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Send sx={{ fontSize: 24 }} />
                    </Button>
                </Box>
                
                {/* Connection Status */}
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {!isConnected ? (
                        <Typography variant="caption" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                            Đang kết nối...
                        </Typography>
                    ) : (
                        <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                            Đã kết nối
                        </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                        Nhấn Enter để gửi, Shift+Enter để xuống dòng
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default Chat;
