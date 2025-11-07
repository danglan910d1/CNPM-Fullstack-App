// Mục đích: Xử lý tạo và lấy danh mục cho người dùng hiện tại.
import { Request, Response } from "express";
import Category from "../models/Category";
import { MongooseError, Types } from "mongoose";

// Tạo danh mục mới
export const createCategory = async (req: Request, res: Response) => {
  try {
    // BẢO MẬT: Lấy userId từ token (req.userId), KHÔNG lấy từ req.body
    const userId = (req as any).userId as string;
    const { name, type } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Tạo Category với userId đã xác thực
    const category = new Category({ userId, name, type });
    await category.save();
    res.status(201).json(category); // Tối ưu: Dùng status 201 cho hành động tạo mới
  } catch (err) {
    // Tối ưu: Xử lý lỗi trùng tên danh mục (Compound Index Error)
    const mongoErr = err as MongooseError; // Bắt lỗi trùng email (MongoDB error code 11000)
    if (mongoErr.cause === 11000) {
      return res
        .status(400)
        .json({ error: "Category name already exists for this user" });
    }
    res.status(500).json({ error: "Create category failed" });
  }
};

// Lấy tất cả danh mục của người dùng hiện tại
export const getCategories = async (req: Request, res: Response) => {
  // Lấy userId từ req.userId (đã được gán bởi authMiddleware)
  const userId = (req as any).userId as string;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  // Chỉ tìm các categories thuộc về người dùng hiện tại (Phạm vi dữ liệu)
  const categories = await Category.find({ userId });
  res.json(categories);
};

// Lấy chi tiết một danh mục của người dùng hiện tại (GET /:id)
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const categoryId = req.params.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 🛡️ BẢO MẬT & KIỂM TRA ID:
    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: "Invalid Category ID" });
    }

    // Chỉ tìm danh mục thuộc về người dùng hiện tại
    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: "Category not found or unauthorized" });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve category" });
  }
};

// Cập nhật danh mục (UPDATE)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const categoryId = req.params.id;
    const updates = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Kiểm tra ID hợp lệ
    // Thêm kiểm tra 'undefined' trước khi gọi Types.ObjectId.isValid()
    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: "Invalid Category ID" });
    }
    // TypeScript đã xác định categoryId là string tại đây

    // Tìm và cập nhật, đảm bảo nó thuộc về người dùng hiện tại
    const category = await Category.findOneAndUpdate(
      {
        _id: categoryId,
        userId: userId, // 🛡️ BẢO MẬT: Chỉ user sở hữu mới sửa được
      },
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ error: "Category not found or unauthorized" });
    }

    res.json(category);
  } catch (err) {
    const mongoErr = err as MongooseError;
    if (mongoErr.cause === 11000) {
      return res
        .status(400)
        .json({ error: "Category name already exists for this user" });
    }
    res.status(500).json({ error: "Update category failed" });
  }
};

// Xóa danh mục (DELETE)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const categoryId = req.params.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Kiểm tra ID hợp lệ
    // Thêm kiểm tra 'undefined' trước khi gọi Types.ObjectId.isValid()
    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: "Invalid Category ID" });
    }
    // TypeScript đã xác định categoryId là string tại đây

    // Tìm và xóa, đảm bảo nó thuộc về người dùng hiện tại
    const result = await Category.findOneAndDelete({
      _id: categoryId,
      userId: userId, // 🛡️ BẢO MẬT: Chỉ user sở hữu mới xóa được
    });

    if (!result) {
      return res
        .status(404)
        .json({ error: "Category not found or unauthorized" });
    }

    // Tùy chọn: Xóa tất cả giao dịch liên quan.
    // Thông thường, người ta chỉ ẩn danh mục hoặc gán lại giao dịch đó cho một danh mục "Uncategorized".
    // Để đơn giản, chúng ta chỉ xóa danh mục.

    res.status(204).send(); // Status 204 No Content cho hành động xóa thành công
  } catch (err) {
    res.status(500).json({ error: "Delete category failed" });
  }
};
