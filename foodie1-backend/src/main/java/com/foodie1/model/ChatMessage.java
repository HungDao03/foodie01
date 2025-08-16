package com.foodie1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;               // Nội dung tin nhắn
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;                  // Người gửi
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;                // Người nhận
    
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    private MessageType messageType;      // Loại tin nhắn
    
    @Column(name = "room_id")
    private String roomId;                // ID phòng chat
    
    @Column(nullable = false)
    private LocalDateTime timestamp;      // Thời gian gửi
    
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;       // Trạng thái đã đọc
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageStatus status = MessageStatus.SENT; // Trạng thái tin nhắn
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;      // Thời gian tạo
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;      // Thời gian cập nhật
    
    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
