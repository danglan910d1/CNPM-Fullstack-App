// routes/analyticsRoutes.ts (File mới)

import { Router } from "express";
import {
  getBalance,
  getTransactionSummary,
} from "../controllers/transactionController"; // Import hàm từ controller
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.use(authMiddleware);

// 🎯 API: GET /api/analytics/balance
router.get("/balance", getBalance);

// 🎯 API: GET /api/analytics/summary?start=...&end=... (Tổng hợp theo loại)
router.get("/summary", getTransactionSummary);

// (Thêm các API báo cáo khác như getReportByMonth nếu cần)

export default router;
