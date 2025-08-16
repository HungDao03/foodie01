package com.foodie1.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageResponse {
    private String id;                    // ID tin nhắn
    private String content;               // Nội dung tin nhắn
    private String senderId;              // ID người gửi
    private String senderName;            // Tên người gửi
    private String senderAvatar;          // Avatar người gửi
    private String receiverId;            // ID người nhận
    private String messageType;           // Loại tin nhắn
    private String roomId;                // ID phòng chat
    private LocalDateTime timestamp;      // Thời gian gửi
    private boolean isRead;               // Trạng thái đã đọc
    private String status;                // Trạng thái tin nhắn: "SENT", "DELIVERED", "READ"
}
