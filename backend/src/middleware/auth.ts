// Xác thực JWT từ header, trích xuất userId, và gán nó vào đối tượng req để các controllers sử dụng an toàn.
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"; // Thư viện đã có định nghĩa kiểu (@types/jsonwebtoken)

// Lấy secret key từ biến môi trường hoặc dùng giá trị mặc định
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Middleware kiểm tra và xác thực token JWT
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Lấy token từ header Authorization (dạng: 'Bearer TOKEN')
  const token = req.headers.authorization?.split(" ")[1];

  // 1. Kiểm tra token tồn tại
  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  try {
    // 2. Xác thực token và giải mã payload
    // Tối ưu: Đảm bảo payload là một object có thuộc tính 'id' kiểu string
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // 3. Gán ID người dùng đã xác thực vào request object
    // KHÔNG cần @ts-ignore nữa vì đã có:
    // a) Cài đặt @types/jsonwebtoken
    // b) Giả định: Đã mở rộng interface Request (thêm file types/express.d.ts)
    (req as any).userId = decoded.id;

    // Chuyển sang middleware hoặc controller tiếp theo
    next();
  } catch (error) {
    // Tối ưu: Bắt biến lỗi để debug nếu cần
    // 4. Xử lý lỗi token không hợp lệ (hết hạn, sai chữ ký,...)
    return res.status(401).json({ error: "Invalid token" });
  }
};
