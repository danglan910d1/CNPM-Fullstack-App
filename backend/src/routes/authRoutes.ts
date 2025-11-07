// Mục đích: Định nghĩa các đường dẫn công khai liên quan đến Xác thực (Đăng ký/Đăng nhập).
// Gắn với /api/auth
import { Router } from "express";
import { register, login } from "../controllers/userController";

const router = Router();

// Tuyến đường công khai (KHÔNG cần token)
// POST /api/auth/register
router.post("/register", register);
// POST /api/auth/login
router.post("/login", login);

export default router;
