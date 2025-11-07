// controllers/transactionController.ts (Đã hoàn thiện)

import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import { Types } from "mongoose"; // Thêm Types
import Category from "../models/Category";

// Tạo giao dịch mới
export const createTransaction = async (req: Request, res: Response) => {
  try {
    // BẢO MẬT: Lấy userId từ token (req.userId)
    const userId = (req as any).userId as string;
    const { categoryId, amount, date, description } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 🛡️ BƯỚC BẢO MẬT MỚI: KIỂM TRA TÍNH TOÀN VẸN CỦA categoryId
    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      // 1. Kiểm tra Category có tồn tại không
      const category = await Category.findById(categoryId);
      if (!category) {
        // Trả về lỗi 400 nếu Category không tồn tại
        return res
          .status(400)
          .json({ error: "Invalid categoryId: Category not found" });
      }

      // 2. (TUỲ CHỌN) Nếu muốn bảo mật hơn: kiểm tra Category có thuộc user này không
      // if (category.userId.toString() !== userId) {
      //   return res.status(403).json({ error: "Unauthorized category access" });
      // }
    } else {
      // Điều này đã được Mongoose Schema (required: true) xử lý,
      // nhưng chúng ta thêm check cho chắc chắn.
      return res
        .status(400)
        .json({ error: "categoryId is required and must be a valid ID" });
    }

    const transaction = new Transaction({
      userId,
      categoryId,
      amount,
      date,
      description,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Create transaction failed" });
  }
};

// Lấy tất cả giao dịch của người dùng hiện tại
// export const getTransactions = async (req: Request, res: Response) => {
//   // Lấy userId từ req.userId (đã được gán bởi authMiddleware)
//   const userId = (req as any).userId as string;

//   if (!userId) return res.status(401).json({ error: "Unauthorized" }); // Chỉ tìm các giao dịch thuộc về người dùng hiện tại
//   // Dùng .populate("categoryId") để lấy chi tiết tên/loại danh mục

//   const transactions = await Transaction.find({ userId }).populate(
//     "categoryId"
//   );
//   res.json(transactions);
// };

// Lấy tất cả giao dịch của người dùng hiện tại (Hỗ trợ lọc ngày)
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { start, end } = req.query; // Lấy tham số query start và end

    if (!userId) return res.status(401).json({ error: "Unauthorized" }); // 1. Xây dựng bộ lọc chính (luôn bao gồm userId)

    const filter: any = { userId };
    const dateFilter: any = {}; // 2. Xử lý LỌC THEO NGÀY

    if (start || end) {
      if (start && typeof start === "string") {
        dateFilter.$gte = new Date(start);
      }
      if (end && typeof end === "string") {
        // Thêm 1 ngày để bao gồm cả ngày kết thúc
        let endDate = new Date(end);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.$lt = endDate;
      } // Gán bộ lọc ngày vào trường 'date' trong bộ lọc chính
      filter.date = dateFilter;
    } // 3. Thực hiện truy vấn

    const transactions = await Transaction.find(filter)
      .populate("categoryId")
      .sort({ date: -1 }); // Tối ưu: Sắp xếp theo ngày mới nhất lên đầu

    res.json(transactions);
  } catch (err) {
    console.error("Get Transactions Error:", err);
    res.status(500).json({ error: "Failed to retrieve transactions" });
  }
};

// Lấy chi tiết một giao dịch của người dùng hiện tại (GET /:id)
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const transactionId = req.params.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 🛡️ BẢO MẬT & KIỂM TRA ID:
    if (!transactionId || !Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ error: "Invalid Transaction ID" });
    }

    // Chỉ tìm giao dịch thuộc về người dùng hiện tại
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: userId,
    }).populate("categoryId");

    if (!transaction) {
      return res
        .status(404)
        .json({ error: "Transaction not found or unauthorized" });
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve transaction" });
  }
};

export const getTransactionSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const { start, end } = req.query;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const dateFilter: any = {};

    // Xử lý LỌC THEO NGÀY (giống getTransactions)
    if (start || end) {
      if (start && typeof start === "string") {
        dateFilter.$gte = new Date(start);
      }
      if (end && typeof end === "string") {
        // Thêm 1 ngày để bao gồm cả ngày kết thúc
        let endDate = new Date(end);
        endDate.setDate(endDate.getDate() + 1);
        dateFilter.$lt = endDate;
      }
    }

    // 🎯 Pipeline Aggregate: Nhóm và tính tổng
    const summary = await Transaction.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId), // Chuyển sang ObjectId để aggregate
          date: dateFilter, // Áp dụng bộ lọc ngày
        },
      },
      {
        $lookup: {
          // Nối với Category để phân biệt type
          from: "categories", // Tên collection Categories
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" }, // Giải nén kết quả lookup
      {
        $group: {
          _id: "$categoryInfo.type", // Nhóm theo 'expense' hoặc 'income'
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Định dạng lại kết quả cho dễ đọc
    const income = summary.find((item) => item._id === "income")?.total || 0;
    const expense = summary.find((item) => item._id === "expense")?.total || 0;

    const result = {
      income: income,
      expense: expense,
      balance: income - expense, // Thêm 'balance' vào đối tượng ngay khi tạo
    };

    res.json(result);
  } catch (err) {
    console.error("Summary Error:", err);
    res.status(500).json({ error: "Failed to get transaction summary" });
  }
};

// Lấy Số dư Hiện tại (Balance)
export const getBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Tái sử dụng logic summary nhưng không cần lọc ngày (lấy tổng)
    const summary = await Transaction.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const income = summary.find((item) => item._id === "income")?.total || 0;
    const expense = summary.find((item) => item._id === "expense")?.total || 0;
    const balance = income - expense;

    res.json({ income, expense, balance });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate balance" });
  }
};

// Cập nhật giao dịch (UPDATE)
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const transactionId = req.params.id;
    const updates = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Kiểm tra ID hợp lệ
    if (!transactionId || !Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ error: "Invalid Transaction ID" });
    }

    // Tìm và cập nhật, đảm bảo nó thuộc về người dùng hiện tại
    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: transactionId,
        userId: userId, // 🛡️ BẢO MẬT
      },
      updates,
      { new: true, runValidators: true }
    ).populate("categoryId");

    if (!transaction) {
      return res
        .status(404)
        .json({ error: "Transaction not found or unauthorized" });
    }

    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: "Update transaction failed" });
  }
};

// Xóa giao dịch (DELETE)
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as string;
    const transactionId = req.params.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Kiểm tra ID hợp lệ
    if (!transactionId || !Types.ObjectId.isValid(transactionId)) {
      return res.status(400).json({ error: "Invalid Transaction ID" });
    }
    // Tìm và xóa, đảm bảo nó thuộc về người dùng hiện tại
    const result = await Transaction.findOneAndDelete({
      _id: transactionId,
      userId: userId, // 🛡️ BẢO MẬT
    });

    if (!result) {
      return res
        .status(404)
        .json({ error: "Transaction not found or unauthorized" });
    }

    res.status(204).send(); // Status 204 No Content
  } catch (err) {
    res.status(500).json({ error: "Delete transaction failed" });
  }
};
