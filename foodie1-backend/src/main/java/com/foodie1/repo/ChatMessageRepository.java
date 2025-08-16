package com.foodie1.repo;

import com.foodie1.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    // Lấy tin nhắn giữa 2 user
    @Query("SELECT cm FROM ChatMessage cm WHERE " +
           "(cm.sender.id = :userId1 AND cm.receiver.id = :userId2) OR " +
           "(cm.sender.id = :userId2 AND cm.receiver.id = :userId1) " +
           "ORDER BY cm.timestamp ASC")
    List<ChatMessage> findMessagesBetweenUsers(@Param("userId1") Long userId1, 
                                             @Param("userId2") Long userId2);
    
    // Lấy tin nhắn với phân trang
    @Query("SELECT cm FROM ChatMessage cm WHERE " +
           "(cm.sender.id = :userId1 AND cm.receiver.id = :userId2) OR " +
           "(cm.sender.id = :userId2 AND cm.receiver.id = :userId1) " +
           "ORDER BY cm.timestamp DESC")
    Page<ChatMessage> findMessagesBetweenUsersWithPagination(@Param("userId1") Long userId1, 
                                                            @Param("userId2") Long userId2, 
                                                            Pageable pageable);
    
    // Đếm tin nhắn chưa đọc
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.receiver.id = :userId AND cm.isRead = false")
    Long countUnreadMessages(@Param("userId") Long userId);
    
    // Lấy tin nhắn chưa đọc
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.receiver.id = :userId AND cm.isRead = false ORDER BY cm.timestamp ASC")
    List<ChatMessage> findUnreadMessages(@Param("userId") Long userId);
    
    // Lấy tin nhắn theo roomId
    List<ChatMessage> findByRoomIdOrderByTimestampAsc(String roomId);
    
    // Lấy tin nhắn cuối cùng giữa 2 user
    @Query("SELECT cm FROM ChatMessage cm WHERE " +
           "(cm.sender.id = :userId1 AND cm.receiver.id = :userId2) OR " +
           "(cm.sender.id = :userId2 AND cm.receiver.id = :userId1) " +
           "ORDER BY cm.timestamp DESC")
    List<ChatMessage> findLatestMessageBetweenUsers(@Param("userId1") Long userId1, 
                                                   @Param("userId2") Long userId2, 
                                                   Pageable pageable);
    
    // Lấy tin nhắn gần đây để tạo danh sách chat
    @Query("SELECT cm FROM ChatMessage cm ORDER BY cm.timestamp DESC")
    List<ChatMessage> findRecentMessages(Pageable pageable);
    
    // Đếm tin nhắn chưa đọc từ một user cụ thể
    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.receiver.id = :receiverId AND cm.sender.id = :senderId AND cm.isRead = false")
    Long countUnreadMessagesFromUser(@Param("receiverId") Long receiverId, @Param("senderId") Long senderId);
}
