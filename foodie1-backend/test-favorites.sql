-- Script test để thêm món ăn yêu thích
-- Chạy script này trong database để test chức năng yêu thích

-- 1. Kiểm tra bảng food_items có trường favorite không
DESCRIBE food_items;

-- 2. Xem dữ liệu hiện tại
SELECT id, name, favorite, deleted FROM food_items LIMIT 10;

-- 3. Cập nhật một số món ăn thành yêu thích (favorite = 1)
UPDATE food_items 
SET favorite = 1 
WHERE id IN (1, 2, 3) 
AND deleted = false;

-- 4. Kiểm tra kết quả
SELECT id, name, favorite, deleted 
FROM food_items 
WHERE favorite = 1 AND deleted = false;

-- 5. Test API endpoint - món ăn yêu thích
-- GET /api/food-items/favorites
-- Sẽ trả về các món ăn có favorite = 1
