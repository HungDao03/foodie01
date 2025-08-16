import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Container, 
    Avatar, 
    IconButton,
    Fade,
    useTheme
} from '@mui/material';
import { 
    Support as SupportIcon,
    Close
} from '@mui/icons-material';
import Chat from '../../../components/Chat';
import { chatService } from '../../../service/chatService';
import { toast } from 'react-toastify';

const ChatPage = () => {
    const [selectedChatId, setSelectedChatId] = useState('1');
    const [selectedChatInfo, setSelectedChatInfo] = useState({
        id: '1', 
        name: 'Admin Hỗ Trợ', 
        avatar: '/admin-avatar.jpg'
    });
    const theme = useTheme();

    const handleChatClose = () => {
        // Không cho phép đóng chat, luôn hiển thị
        return;
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4, p: 0 }}>
            <Fade in={true} timeout={500}>
                <Paper 
                    elevation={24}
                    sx={{ 
                        height: '90vh',
                        borderRadius: 4,
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
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
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
                                <SupportIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="700" color="white" gutterBottom>
                                    {selectedChatInfo?.name || 'Admin Hỗ Trợ'}
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
                    </Box>

                    {/* Chat Messages */}
                    <Box sx={{ 
                        flex: 1, 
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        bgcolor: theme.palette.background.paper,
                        height: 'calc(90vh - 120px)',
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
                            receiverName={selectedChatInfo?.name || 'Admin Hỗ Trợ'}
                            receiverAvatar={selectedChatInfo?.avatar}
                            isInline={true}
                        />
                    </Box>
                </Paper>
            </Fade>
        </Container>
    );
};

export default ChatPage;
