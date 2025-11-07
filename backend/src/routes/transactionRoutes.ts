// Mục đích: Bảo vệ tất cả các hành động liên quan đến giao dịch.
import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionById,
  getTransactions,
  updateTransaction,
} from "../controllers/transactionController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
// Tối ưu: Áp dụng authMiddleware cho tất cả các tuyến đường bên dưới
router.use(authMiddleware);

// POST: Tạo giao dịch mới
router.post("/", createTransaction);
// GET: Lấy tất cả giao dịch
router.get("/", getTransactions);
// GET BY ID: Lấy chi tiết một giao dịch
router.get("/:id", getTransactionById);
// PUT: Cập nhật giao dịch theo ID
router.put("/:id", updateTransaction);
// DELETE: Xóa giao dịch theo ID
router.delete("/:id", deleteTransaction);

export default router;
