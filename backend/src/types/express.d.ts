import "express";

// 1. Mở rộng Request gốc của Express (cho authMiddleware gán giá trị)
declare module "express-serve-static-core" {
  interface Request {
    userId?: string; // Tùy chọn, cho phép là undefined khi request mới tới
  }
}

// 2. Định nghĩa một kiểu Request mới cho các Controllers đã được bảo vệ
export interface AuthenticatedRequest extends Express.Request {
  // BẮT BUỘC: Ghi đè trường userId để yêu cầu nó phải tồn tại
  userId: string;
}
