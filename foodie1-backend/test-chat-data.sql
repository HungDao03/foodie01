-- Insert tin nhắn mẫu cho chat
INSERT INTO chat_messages (id, content, sender_id, receiver_id, message_type, message_status, timestamp, room_id) VALUES
(1, 'Chào bạn! Cần hỗ trợ gì không?', 1, 2, 'TEXT', 'SENT', NOW(), NULL),
(2, 'Chào admin! Tôi cần hỗ trợ về đơn hàng', 2, 1, 'TEXT', 'SENT', NOW(), NULL),
(3, 'Bạn có thể cho tôi biết mã đơn hàng không?', 1, 2, 'TEXT', 'SENT', NOW(), NULL);

-- Cập nhật timestamp cho tin nhắn mẫu
UPDATE chat_messages SET timestamp = DATE_SUB(NOW(), INTERVAL 1 HOUR) WHERE id = 1;
UPDATE chat_messages SET timestamp = DATE_SUB(NOW(), INTERVAL 30 MINUTE) WHERE id = 2;
UPDATE chat_messages SET timestamp = DATE_SUB(NOW(), INTERVAL 15 MINUTE) WHERE id = 3;
