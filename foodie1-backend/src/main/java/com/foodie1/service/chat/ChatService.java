package com.foodie1.service.chat;

import com.foodie1.dto.request.ChatMessageRequest;
import com.foodie1.dto.response.ChatMessageResponse;
import com.foodie1.model.ChatMessage;
import com.foodie1.model.MessageStatus;
import com.foodie1.model.MessageType;
import com.foodie1.model.User;
import com.foodie1.repo.ChatMessageRepository;
import com.foodie1.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class ChatService implements IChatService {
    
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepo userRepo;
    private final SimpMessagingTemplate messagingTemplate;
    
    @Override
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request, Long senderId) {
        // Lấy thông tin người gửi
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        // Lấy thông tin người nhận
        User receiver = userRepo.findById(Long.parseLong(request.getReceiverId()))
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        // Tạo tin nhắn mới
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setContent(request.getContent());
        chatMessage.setSender(sender);
        chatMessage.setReceiver(receiver);
        chatMessage.setMessageType(MessageType.valueOf(request.getMessageType()));
        chatMessage.setRoomId(request.getRoomId() != null ? request.getRoomId() : createRoomId(senderId, receiver.getId()));
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setStatus(MessageStatus.SENT);
        chatMessage.setRead(false);
        
        // Lưu vào database
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        
        // Chuyển đổi thành response
        ChatMessageResponse response = convertToResponse(savedMessage);
        
        // Gửi tin nhắn qua WebSocket đến người nhận
        messagingTemplate.convertAndSendToUser(
            receiver.getId().toString(),
            "/queue/messages",
            response
        );
        
        // Gửi tin nhắn qua WebSocket đến người gửi (để confirm)
        messagingTemplate.convertAndSendToUser(
            sender.getId().toString(),
            "/queue/messages",
            response
        );
        
        return response;
    }
    
    @Override
    public List<ChatMessageResponse> getMessagesBetweenUsers(Long userId1, Long userId2) {
        List<ChatMessage> messages = chatMessageRepository.findMessagesBetweenUsers(userId1, userId2);
        return messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<ChatMessageResponse> getMessagesBetweenUsersWithPagination(Long userId1, Long userId2, Pageable pageable) {
        Page<ChatMessage> messages = chatMessageRepository.findMessagesBetweenUsersWithPagination(userId1, userId2, pageable);
        return messages.map(this::convertToResponse);
    }
    
    @Override
    @Transactional
    public void markMessageAsRead(Long messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        message.setStatus(MessageStatus.READ);
        chatMessageRepository.save(message);
    }
    
    @Override
    @Transactional
    public void markAllMessagesAsRead(Long receiverId, Long senderId) {
        List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessages(receiverId);
        unreadMessages.stream()
                .filter(message -> message.getSender().getId().equals(senderId))
                .forEach(message -> {
                    message.setRead(true);
                    message.setStatus(MessageStatus.READ);
                });
        chatMessageRepository.saveAll(unreadMessages);
    }
    
    @Override
    public Long countUnreadMessages(Long userId) {
        return chatMessageRepository.countUnreadMessages(userId);
    }
    
    @Override
    public List<ChatMessageResponse> getUnreadMessages(Long userId) {
        List<ChatMessage> messages = chatMessageRepository.findUnreadMessages(userId);
        return messages.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public ChatMessageResponse getLatestMessageBetweenUsers(Long userId1, Long userId2) {
        List<ChatMessage> messages = chatMessageRepository.findLatestMessageBetweenUsers(userId1, userId2, PageRequest.of(0, 1));
        if (messages.isEmpty()) {
            return null;
        }
        return convertToResponse(messages.get(0));
    }
    
    @Override
    public String createRoomId(Long userId1, Long userId2) {
        // Tạo roomId duy nhất cho 2 user
        Long minId = Math.min(userId1, userId2);
        Long maxId = Math.max(userId1, userId2);
        return "room_" + minId + "_" + maxId + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    @Override
    public List<Map<String, Object>> getChatConversations() {
        try {
            // Lấy tất cả tin nhắn gần đây, nhóm theo user để tạo conversations
            List<ChatMessage> recentMessages = chatMessageRepository.findRecentMessages(PageRequest.of(0, 100));
            
            // Nhóm tin nhắn theo user để tạo conversations
            Map<Long, Map<String, Object>> conversationsMap = new HashMap<>();
            
            for (ChatMessage message : recentMessages) {
                Long userId = message.getSender().getId();
                
                // Bỏ qua tin nhắn từ admin (userId = 1)
                if (userId == 1L) {
                    continue;
                }
                
                if (!conversationsMap.containsKey(userId)) {
                    // Tạo conversation mới
                    Map<String, Object> conversation = new HashMap<>();
                    conversation.put("userId", userId);
                    conversation.put("userName", message.getSender().getFullName());
                    conversation.put("userAvatar", message.getSender().getAvatar());
                    conversation.put("lastMessage", message.getContent());
                    conversation.put("lastMessageTime", message.getTimestamp());
                    conversation.put("unreadCount", 0L); // Sẽ tính sau
                    conversation.put("conversationId", "conv_" + userId);
                    
                    conversationsMap.put(userId, conversation);
                } else {
                    // Cập nhật tin nhắn cuối cùng nếu tin nhắn này mới hơn
                    Map<String, Object> existing = conversationsMap.get(userId);
                    LocalDateTime existingTime = (LocalDateTime) existing.get("lastMessageTime");
                    if (message.getTimestamp().isAfter(existingTime)) {
                        existing.put("lastMessage", message.getContent());
                        existing.put("lastMessageTime", message.getTimestamp());
                    }
                }
            }
            
            // Tính unread count cho mỗi conversation
            for (Map<String, Object> conversation : conversationsMap.values()) {
                Long userId = (Long) conversation.get("userId");
                Long unreadCount = chatMessageRepository.countUnreadMessagesFromUser(1L, userId);
                conversation.put("unreadCount", unreadCount);
            }
            
            return new ArrayList<>(conversationsMap.values());
        } catch (Exception e) {
            System.err.println("Error getting chat conversations: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    @Override
    public List<ChatMessageResponse> getRecentMessages(int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<ChatMessage> messages = chatMessageRepository.findRecentMessages(pageable);
            return messages.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting recent messages: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private ChatMessageResponse convertToResponse(ChatMessage message) {
        return new ChatMessageResponse(
            message.getId().toString(),
            message.getContent(),
            message.getSender().getId().toString(),
            message.getSender().getFullName(),
            message.getSender().getAvatar(),
            message.getReceiver().getId().toString(),
            message.getMessageType().name(),
            message.getRoomId(),
            message.getTimestamp(),
            message.isRead(),
            message.getStatus().name()
        );
    }
}
