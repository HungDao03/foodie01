package com.foodie1.service.chat;

import com.foodie1.dto.request.ChatMessageRequest;
import com.foodie1.dto.response.ChatMessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface IChatService {
    
    // Gửi tin nhắn
    ChatMessageResponse sendMessage(ChatMessageRequest request, Long senderId);
    
    // Lấy tin nhắn giữa 2 user
    List<ChatMessageResponse> getMessagesBetweenUsers(Long userId1, Long userId2);
    
    // Lấy tin nhắn với phân trang
    Page<ChatMessageResponse> getMessagesBetweenUsersWithPagination(Long userId1, Long userId2, Pageable pageable);
    
    // Đánh dấu tin nhắn đã đọc
    void markMessageAsRead(Long messageId);
    
    // Đánh dấu tất cả tin nhắn từ user đã đọc
    void markAllMessagesAsRead(Long receiverId, Long senderId);
    
    // Đếm tin nhắn chưa đọc
    Long countUnreadMessages(Long userId);
    
    // Lấy tin nhắn chưa đọc
    List<ChatMessageResponse> getUnreadMessages(Long userId);
    
    // Lấy tin nhắn cuối cùng giữa 2 user
    ChatMessageResponse getLatestMessageBetweenUsers(Long userId1, Long userId2);
    
    // Tạo roomId cho 2 user
    String createRoomId(Long userId1, Long userId2);
    
    // Lấy danh sách chat conversations cho admin
    List<Map<String, Object>> getChatConversations();
    
    // Lấy tin nhắn gần đây để tạo danh sách chat
    List<ChatMessageResponse> getRecentMessages(int limit);
}
