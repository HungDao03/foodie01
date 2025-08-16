import { axiosInstance } from '../configs/axios.config.js';

export const chatService = {
    // Gửi tin nhắn
    sendMessage: async (messageData) => {
        try {
            const response = await axiosInstance.post('/chat/send', messageData);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    // Lấy tin nhắn giữa 2 user
    getMessagesBetweenUsers: async (userId1, userId2) => {
        try {
            console.log('Calling getMessagesBetweenUsers with URL:', `/chat/messages/${userId1}/${userId2}`);
            const response = await axiosInstance.get(`/chat/messages/${userId1}/${userId2}`);
            return response.data;
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    },

    // Lấy tin nhắn với phân trang
    getMessagesWithPagination: async (userId1, userId2, page = 0, size = 20) => {
        try {
            const response = await axiosInstance.get(`/chat/messages/${userId1}/${userId2}/page?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error('Error getting messages with pagination:', error);
            throw error;
        }
    },

    // Đánh dấu tin nhắn đã đọc
    markMessageAsRead: async (messageId) => {
        try {
            const response = await axiosInstance.put(`/chat/messages/${messageId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    },

    // Đánh dấu tất cả tin nhắn từ user đã đọc
    markAllMessagesAsRead: async (senderId) => {
        try {
            const response = await axiosInstance.put(`/chat/messages/read-all/${senderId}`);
            return response.data;
        } catch (error) {
            console.error('Error marking all messages as read:', error);
            throw error;
        }
    },

    // Đếm tin nhắn chưa đọc
    countUnreadMessages: async () => {
        try {
            console.log('Calling countUnreadMessages with URL:', '/chat/unread/count');
            const response = await axiosInstance.get('/chat/unread/count');
            return response.data;
        } catch (error) {
            console.error('Error counting unread messages:', error);
            throw error;
        }
    },

    // Lấy tin nhắn chưa đọc
    getUnreadMessages: async () => {
        try {
            const response = await axiosInstance.get('/chat/unread');
            return response.data;
        } catch (error) {
            console.error('Error getting unread messages:', error);
            throw error;
        }
    },

    // Lấy tin nhắn cuối cùng giữa 2 user
    getLatestMessage: async (userId1, userId2) => {
        try {
            const response = await axiosInstance.get(`/chat/latest/${userId1}/${userId2}`);
            return response.data;
        } catch (error) {
            console.error('Error getting latest message:', error);
            throw error;
        }
    },

    // Tạo roomId cho 2 user
    createRoomId: async (userId1, userId2) => {
        try {
            const response = await axiosInstance.post(`/chat/room/${userId1}/${userId2}`);
            return response.data;
        } catch (error) {
            console.error('Error creating room ID:', error);
            throw error;
        }
    },

    // Lấy danh sách chat conversations cho admin
    getChatConversations: async () => {
        try {
            const response = await axiosInstance.get('/chat/conversations');
            return response.data;
        } catch (error) {
            console.error('Error getting chat conversations:', error);
            // Fallback: trả về null để sử dụng getRecentMessages
            return null;
        }
    },

    // Lấy tin nhắn gần đây để tạo danh sách chat
    getRecentMessages: async (limit = 50) => {
        try {
            const response = await axiosInstance.get(`/chat/recent?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error getting recent messages:', error);
            // Fallback: sử dụng getUnreadMessages
            try {
                const unreadResponse = await axiosInstance.get('/chat/unread');
                return unreadResponse.data;
            } catch (fallbackError) {
                console.error('Fallback error getting unread messages:', fallbackError);
                return [];
            }
        }
    }
};
