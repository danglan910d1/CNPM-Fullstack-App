// Định nghĩa Schema giao dịch
// Có hai liên kết Foreign Key quan trọng: userId (người sở hữu) và categoryId (phân loại).

import { Schema, Types, model } from "mongoose";

export interface ITransaction {
  // ID của người dùng sở hữu giao dịch (Tham chiếu đến Model User)
  userId: Types.ObjectId;
  // ID của danh mục liên quan (Tham chiếu đến Model Category)
  categoryId: Types.ObjectId;
  amount: number;
  date: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Định nghĩa Schema Mongoose (Quy tắc Cơ sở dữ liệu)
const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Số tiền: Bắt buộc, phải là số dương (> 0.01)
    amount: { type: Number, required: true, min: 0.01 },
    // Ngày giao dịch: Bắt buộc (quan trọng cho thống kê)
    date: { type: Date, required: true },
    description: { type: String }, // Trường tùy chọn
    // createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Tạo Model để tương tác với Collection 'transactions' trong DB
export default model<ITransaction>("Transaction", transactionSchema);
