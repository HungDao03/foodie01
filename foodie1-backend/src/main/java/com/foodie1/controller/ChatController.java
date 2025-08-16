package com.foodie1.controller;

import com.foodie1.dto.request.ChatMessageRequest;
import com.foodie1.dto.response.ChatMessageResponse;
import com.foodie1.service.chat.IChatService;
import com.foodie1.config.DTO.UserPrinciple;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {
    
    private final IChatService chatService;
    
    // WebSocket endpoint để gửi tin nhắn
    @MessageMapping("/send-message")
    public void sendMessage(@Payload ChatMessageRequest request, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // Lấy senderId từ message body (frontend gửi)
            String senderIdStr = request.getSenderId();
            if (senderIdStr != null && !senderIdStr.trim().isEmpty()) {
                // Convert String sang Long
                Long senderId = Long.parseLong(senderIdStr);
                // Lưu tin nhắn vào database
                ChatMessageResponse savedMessage = chatService.sendMessage(request, senderId);
                System.out.println("Message saved via WebSocket: " + savedMessage);
            } else {
                System.out.println("Sender ID not found in message body");
            }
        } catch (NumberFormatException e) {
            System.err.println("Invalid sender ID format: " + request.getSenderId());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Error processing WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // REST API để gửi tin nhắn
    @PostMapping("/send")
    public ResponseEntity<ChatMessageResponse> sendMessage(@RequestBody ChatMessageRequest request) {
        Long senderId = getCurrentUserId();
        ChatMessageResponse response = chatService.sendMessage(request, senderId);
        return ResponseEntity.ok(response);
    }
    
    // Lấy tin nhắn giữa 2 user
    @GetMapping("/messages/{userId1}/{userId2}")
    public ResponseEntity<List<ChatMessageResponse>> getMessagesBetweenUsers(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        List<ChatMessageResponse> messages = chatService.getMessagesBetweenUsers(userId1, userId2);
        return ResponseEntity.ok(messages);
    }
    
    // Lấy tin nhắn với phân trang
    @GetMapping("/messages/{userId1}/{userId2}/page")
    public ResponseEntity<Page<ChatMessageResponse>> getMessagesWithPagination(
            @PathVariable Long userId1,
            @PathVariable Long userId2,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessageResponse> messages = chatService.getMessagesBetweenUsersWithPagination(userId1, userId2, pageable);
        return ResponseEntity.ok(messages);
    }
    
    // Đánh dấu tin nhắn đã đọc
    @PutMapping("/messages/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        chatService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }
    
    // Đánh dấu tất cả tin nhắn từ user đã đọc
    @PutMapping("/messages/read-all/{senderId}")
    public ResponseEntity<Void> markAllMessagesAsRead(@PathVariable Long senderId) {
        Long receiverId = getCurrentUserId();
        chatService.markAllMessagesAsRead(receiverId, senderId);
        return ResponseEntity.ok().build();
    }
    
    // Đếm tin nhắn chưa đọc
    @GetMapping("/unread/count")
    public ResponseEntity<Long> countUnreadMessages() {
        Long userId = getCurrentUserId();
        Long count = chatService.countUnreadMessages(userId);
        return ResponseEntity.ok(count);
    }
    
    // Lấy tin nhắn chưa đọc
    @GetMapping("/unread")
    public ResponseEntity<List<ChatMessageResponse>> getUnreadMessages() {
        Long userId = getCurrentUserId();
        List<ChatMessageResponse> messages = chatService.getUnreadMessages(userId);
        return ResponseEntity.ok(messages);
    }
    
    // Lấy tin nhắn cuối cùng giữa 2 user
    @GetMapping("/latest/{userId1}/{userId2}")
    public ResponseEntity<ChatMessageResponse> getLatestMessage(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        ChatMessageResponse message = chatService.getLatestMessageBetweenUsers(userId1, userId2);
        return ResponseEntity.ok(message);
    }
    
    // Tạo roomId cho 2 user
    @PostMapping("/room/{userId1}/{userId2}")
    public ResponseEntity<String> createRoomId(@PathVariable Long userId1, @PathVariable Long userId2) {
        String roomId = chatService.createRoomId(userId1, userId2);
        return ResponseEntity.ok(roomId);
    }
    
    // Lấy danh sách chat conversations cho admin
    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getChatConversations() {
        try {
            System.out.println("Getting chat conversations...");
            List<Map<String, Object>> conversations = chatService.getChatConversations();
            System.out.println("Found " + (conversations != null ? conversations.size() : 0) + " conversations");
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            System.err.println("Error getting chat conversations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Lấy tin nhắn gần đây để tạo danh sách chat
    @GetMapping("/recent")
    public ResponseEntity<List<ChatMessageResponse>> getRecentMessages(
            @RequestParam(defaultValue = "50") int limit) {
        try {
            System.out.println("Getting recent messages with limit: " + limit);
            List<ChatMessageResponse> messages = chatService.getRecentMessages(limit);
            System.out.println("Found " + (messages != null ? messages.size() : 0) + " recent messages");
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Error getting recent messages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Lấy userId hiện tại từ Security Context
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrinciple) {
            UserPrinciple userPrinciple = (UserPrinciple) authentication.getPrincipal();
            return userPrinciple.getId();
        }
        throw new RuntimeException("User not authenticated");
    }
}
