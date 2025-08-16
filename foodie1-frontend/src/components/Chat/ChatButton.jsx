import React, { useState, useEffect } from 'react';
import { Fab, Badge, Tooltip } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import Chat from './index';
import { chatService } from '../../service/chatService';

const ChatButton = ({ receiverId, receiverName, receiverAvatar }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (receiverId) {
            loadUnreadCount();
            // Cập nhật unread count mỗi 30 giây
            const interval = setInterval(loadUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [receiverId]);

    const loadUnreadCount = async () => {
        try {
            const count = await chatService.countUnreadMessages();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const handleChatOpen = () => {
        setIsChatOpen(true);
        // Reset unread count khi mở chat
        setUnreadCount(0);
    };

    const handleChatClose = () => {
        setIsChatOpen(false);
    };

    if (!receiverId) return null;

    return (
        <>
            <Tooltip title={`Chat với ${receiverName}`} placement="left">
                <Fab
                    color="primary"
                    size="medium"
                    onClick={handleChatOpen}
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 999
                    }}
                >
                    <Badge badgeContent={unreadCount} color="error">
                        <ChatIcon />
                    </Badge>
                </Fab>
            </Tooltip>

            <Chat
                isOpen={isChatOpen}
                onClose={handleChatClose}
                receiverId={receiverId}
                receiverName={receiverName}
                receiverAvatar={receiverAvatar}
            />
        </>
    );
};

export default ChatButton;
