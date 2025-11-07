// Mục đích: Bảo vệ tất cả các hành động liên quan đến danh mục.
import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
// Tối ưu: Áp dụng authMiddleware cho tất cả các tuyến đường bên dưới
router.use(authMiddleware);

// POST: Tạo danh mục mới
router.post("/", createCategory);
// GET: Lấy tất cả danh mục
router.get("/", getCategories);

// GET BY ID: Lấy danh mục theo id
router.get("/:id", getCategoryById);

// PUT: Cập nhật danh mục theo ID
router.put("/:id", updateCategory);
// DELETE: Xóa danh mục theo ID
router.delete("/:id", deleteCategory);

export default router;
