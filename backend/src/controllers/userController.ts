// Mục đích: Xử lý đăng ký, đăng nhập và lấy thông tin người dùng hiện tại.

import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MongooseError } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Đăng ký người dùng mới
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Đảm bảo dữ liệu tồn tại cơ bản
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Missing required fields (name, email, password)." });
    }

    // 1. Hash mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // 2. Tạo JWT sau khi đăng ký thành công
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Tối ưu: Chỉ trả về thông tin cần thiết (tránh trả về user.password)
    res.json({ id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    // Tối ưu: Bắt lỗi trùng email (MongoDB error code 11000)
    // 🛡️ Tối ưu: Kiểm tra xem 'err' có phải là đối tượng lỗi có thuộc tính 'code' không
    const mongoErr = err as MongooseError; // Bắt lỗi trùng email (MongoDB error code 11000)

    // In lỗi thực tế ra console server để debug
    console.error("Registration Error:", err);

    if (mongoErr && mongoErr.cause === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    // Trả về lỗi chung
    res.status(500).json({ error: "Register failed" });
  }
};

// Đăng nhập người dùng
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm kiếm người dùng và BẮT BUỘC chọn trường password đã bị ẩn (select: false)
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ error: "User not found" });

    // 2. So sánh mật khẩu đã hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    // 3. Tạo token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    // Tối ưu: Trả về thông tin User và token
    res.json({ id: user._id, name: user.name, email: user.email, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Lấy thông tin người dùng hiện tại (dùng token)
export const getMe = async (req: Request, res: Response) => {
  // Lấy userId từ req.userId (đã được gán bởi authMiddleware), loại bỏ @ts-ignore
  const userId = (req as any).userId as string;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Tìm người dùng bằng ID
  const user = await User.findById(userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
};

// PUT /api/users/password: Thay đổi mật khẩu
export const updatePassword = async (req: Request, res: Response) => {
  try {
    // Lấy userId từ authMiddleware
    const userId = (req as any).userId as string;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Please provide current and new password" });
    }

    // Tìm người dùng và BẮT BUỘC chọn trường password
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🛡️ Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // 🛡️ Băm mật khẩu mới và cập nhật
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
};

// PUT /api/users/profile: Cập nhật thông tin profile (tên)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { name } = req.body; // Chỉ cho phép cập nhật tên

    if (!name) {
      return res
        .status(400)
        .json({ error: "Please provide a name for update" });
    }

    // Tìm và cập nhật user, loại bỏ mật khẩu khỏi kết quả
    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true, runValidators: true, select: "-password" }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
