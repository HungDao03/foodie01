package com.foodie1.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageRequest {
    private String content;        // Nội dung tin nhắn
    private String senderId;       // ID người gửi
    private String receiverId;     // ID người nhận (có thể là userId hoặc "admin")
    private String messageType;    // Loại tin nhắn: "TEXT", "IMAGE", "SYSTEM"
    private String roomId;         // ID phòng chat (nếu có)
}
