package com.foodie1.service.file;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path foodDir = Paths.get("uploads/food");
    private final Path avatarDir = Paths.get("uploads/avatar");

    /**
     * Khởi tạo các thư mục lưu trữ nếu chưa tồn tại
     */
    public FileStorageService() {
        try {
            if (!Files.exists(foodDir)) Files.createDirectories(foodDir);
            if (!Files.exists(avatarDir)) Files.createDirectories(avatarDir);
        } catch (IOException e) {
            throw new RuntimeException("Không thể khởi tạo thư mục để lưu trữ file!");
        }
    }

    /**
     * Lưu file vào thư mục tương ứng (avatar hoặc food)
     *
     * @param file Multipart file được upload
     * @param type Loại file: "avatar" hoặc "food"
     * @return Tên file đã lưu
     */
    public String saveFile(MultipartFile file, String type) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File không được để trống.");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String filename = UUID.randomUUID().toString() + extension;
            Path targetDir = getTargetDir(type);

            Files.copy(file.getInputStream(), targetDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file. Lỗi: " + e.getMessage());
        }
    }

    /**
     * Xoá file đã lưu theo tên và loại
     *
     * @param filename Tên file
     * @param type     Loại file (avatar hoặc food)
     */
    public void deleteFile(String filename, String type) {
        try {
            if (filename != null && !filename.isEmpty()) {
                Path filePath = getTargetDir(type).resolve(filename);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể xoá file. Lỗi: " + e.getMessage());
        }
    }

    /**
     * Trả về thư mục tương ứng theo loại file
     *
     * @param type "avatar" hoặc "food"
     * @return Path tới thư mục
     */
    private Path getTargetDir(String type) {
        return switch (type.toLowerCase()) {
            case "avatar" -> avatarDir;
            case "food" -> foodDir;
            default -> throw new RuntimeException("Loại file không hợp lệ. Chỉ chấp nhận 'avatar' hoặc 'food'.");
        };
    }
}
