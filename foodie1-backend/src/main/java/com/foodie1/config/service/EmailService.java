package com.foodie1.config.service;

import com.foodie1.model.Order;
import com.foodie1.model.OrderItem;
import com.foodie1.model.User;
import com.foodie1.service.user.UserService;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
public class EmailService {

    @Autowired // Tiêm phụ thuộc JavaMailSender để gửi email
    private JavaMailSender mailSender;

    // Phương thức gửi email xác minh cho người dùng và trả về token xác minh
    public String sendVerificationEmail(User user) {
        try {
            // Tạo một token xác minh duy nhất bằng UUID
            String verificationToken = UUID.randomUUID().toString();

            // Xác định tiêu đề email
            String subject = "Xác nhận tài khoản";

            // Tạo URL xác minh với token, mã hóa URL để đảm bảo an toàn
            String verifyUrl = "http://localhost:8080/api/verify?token=" + URLEncoder.encode(verificationToken, StandardCharsets.UTF_8);

            // Tạo nội dung HTML của email
            String content = "<h3>Xin chào " + user.getFullName() + ",</h3>" // Lời chào với tên đầy đủ của người dùng
                    + "<p>Vui lòng xác nhận tài khoản của bạn bằng cách nhấn vào liên kết sau:</p>" // Hướng dẫn xác minh tài khoản
                    + "<a href=\"" + verifyUrl + "\">Xác minh tài khoản</a>" // Liên kết xác minh
                    + "<p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>"; // Lời cảm ơn

            // Tạo đối tượng MimeMessage để gửi email HTML
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // Hỗ trợ gửi email HTML với mã hóa UTF-8
            helper.setTo(user.getEmail()); // Đặt địa chỉ email người nhận
            helper.setSubject(subject); // Đặt tiêu đề email
            helper.setText(content, true); // Đặt nội dung email, true để hỗ trợ HTML

            // Gửi email
            mailSender.send(message);
            return verificationToken; // Trả về token để lưu vào cơ sở dữ liệu
        } catch (Exception e) {
            // Ném ngoại lệ nếu không thể gửi email
            throw new RuntimeException("Không thể gửi email xác minh: " + e.getMessage());
        }
    }

    // Hàm tiện ích lấy giá ưu tiên discount_price nếu có khuyến mãi
    private String formatPrice(Double discountPrice, Double price) {
        double finalPrice = (discountPrice != null && discountPrice > 0) ? discountPrice : price;
        return String.format("%.0f VND", finalPrice);
    }

    public void sendOrderConfirmationEmail(User user, Order order) {
        try {
            String subject = "Đặt hàng thành công - Mã đơn #" + order.getId();

            StringBuilder itemDetails = new StringBuilder();
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                // Trường hợp đặt từ giỏ hàng (nhiều món)
                for (OrderItem item : order.getItems()) {
                    itemDetails.append("<li>")
                            .append(item.getFoodName())
                            .append(" - SL: ").append(item.getQuantity())
                            .append(", Giá: ").append(formatPrice(item.getDiscountPrice(), item.getPrice()))
                            .append("</li>");
                }
            } else {
                // Trường hợp đặt 1 món (trang chủ)
                itemDetails.append("<li>")
                        .append(order.getFoodItem().getName())
                        .append(" - SL: ").append(order.getQuantity())
                        .append(", Giá: ").append(formatPrice(order.getFoodItem().getDiscountPrice(), order.getPrice()))
                        .append("</li>");
            }

            String content = "<h3>Xin chào " + user.getFullName() + ",</h3>"
                    + "<p>Đơn hàng của bạn đã được ghi nhận thành công với các thông tin sau:</p>"
                    + "<ul>" + itemDetails + "</ul>"
                    + "<p><strong>Tổng tiền:</strong> " + order.getTotalAmount() + " VND</p>"
                    + "<p><strong>Địa chỉ giao:</strong> " + order.getDeliveryAddress() + "</p>"
                    + "<p><strong>Số điện thoại:</strong> " + order.getPhoneNumber() + "</p>"
                    + "<p><strong>Ghi chú:</strong> " + (order.getNotes() != null ? order.getNotes() : "Không có") + "</p>"
                    + "<p>Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>"
                    + "<br><p>Trân trọng,</p><p>Foodie Team</p>";

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email đơn hàng: " + e.getMessage());
        }
    }

    public void sendAdminNotificationEmail(Order order) {
        try {
            String subject = "Đơn hàng mới #" + order.getId();

            StringBuilder itemDetails = new StringBuilder();
            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItem item : order.getItems()) {
                    itemDetails.append("<li>")
                            .append(item.getFoodName())
                            .append(" - SL: ").append(item.getQuantity())
                            .append(", Giá: ").append(formatPrice(item.getDiscountPrice(), item.getPrice()))
                            .append("</li>");
                }
            } else {
                itemDetails.append("<li>")
                        .append(order.getFoodItem().getName())
                        .append(" - SL: ").append(order.getQuantity())
                        .append(", Giá: ").append(formatPrice(order.getFoodItem().getDiscountPrice(), order.getPrice()))
                        .append("</li>");
            }

            String content = "<h3>📦 Đơn hàng mới từ " + order.getUser().getFullName() + "</h3>"
                    + "<p><strong>Email:</strong> " + order.getUser().getEmail() + "</p>"
                    + "<p><strong>Số điện thoại:</strong> " + order.getPhoneNumber() + "</p>"
                    + "<p><strong>Địa chỉ giao:</strong> " + order.getDeliveryAddress() + "</p>"
                    + "<p><strong>Ghi chú:</strong> " + (order.getNotes() != null ? order.getNotes() : "Không có") + "</p>"
                    + "<p><strong>Danh sách món:</strong></p><ul>" + itemDetails + "</ul>"
                    + "<p><strong>Tổng tiền:</strong> " + order.getTotalAmount() + " VND</p>";

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo("daohung102003@gmail.com");
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Không thể gửi email cho admin: " + e.getMessage());
        }
    }
}