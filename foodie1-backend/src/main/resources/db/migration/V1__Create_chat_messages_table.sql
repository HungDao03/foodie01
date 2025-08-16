-- Tạo bảng chat_messages
CREATE TABLE chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    room_id VARCHAR(255),
    timestamp DATETIME NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'SENT',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    
    -- Foreign keys
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_room_id (room_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_is_read (is_read),
    INDEX idx_sender_receiver (sender_id, receiver_id)
);

-- Tạo enum cho message_type (MySQL không hỗ trợ ENUM native, sử dụng VARCHAR)
-- Các giá trị: TEXT, IMAGE, SYSTEM, ORDER, NOTIFICATION

-- Tạo enum cho status (MySQL không hỗ trợ ENUM native, sử dụng VARCHAR)
-- Các giá trị: SENT, DELIVERED, READ
