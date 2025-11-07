// Mục đích: Định nghĩa các đường dẫn bảo mật liên quan đến Quản lý Profile.
// Gắn với /api/users
import { Router } from "express";
// Import các hàm quản lý user
import {
  getMe,
  updatePassword,
  updateProfile,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// 🎯 BẢO MẬT: Áp dụng middleware Auth cho tất cả tuyến đường trong file này
router.use(authMiddleware);

// Tuyến đường bảo mật (CẦN token)
// GET /api/users/me (Lấy thông tin cá nhân)
router.get("/me", getMe);

// PUT /api/users/password (Đổi mật khẩu)
router.put("/password", updatePassword);

// PUT /api/users/profile (Cập nhật tên/profile)
router.put("/profile", updateProfile);

export default router;
