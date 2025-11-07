// Định nghĩa Schema danh mục
// Lưu trữ danh mục chi/ thu liên kết với user
// Sử dụng Compound Index để đảm bảo mỗi user không có danh mục trùng tên
import { Schema, Types, model } from "mongoose"; // Import(thêm) Types để dùng cho TypeScript Interface

// Định nghĩa kiểu dữ liệu TS
export interface ICategory {
  // Thay đổi kiểu dữ liệu của userID tham chiếu thành Types.ObjectId để khớp với Mongoose Schema
  userId: Types.ObjectId;
  name: string;
  type: "income" | "expense"; // đặt type thu/ chi trong Model Category là chuẩn mực tốt nhất để đảm bảo mỗi danh mục chỉ đại diện cho một loại dòng tiền duy nhất.
  // Mongoose tự động thêm với timestamps: true
  createdAt: Date;
  updatedAt: Date;
}

// Định nghĩa Schema Mongoose (Quy tắc Cơ sở dữ liệu)
const categorySchema = new Schema<ICategory>(
  // Định nghĩa field và quy tắc
  {
    // Tham chiếu đến User cần dùng Schema.Types.ObjectId và 'ref'.
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    // Giới hạn giá trị của type chỉ là 'income' hoặc 'expense'
    type: { type: String, enum: ["income", "expense"], required: true },
  },
  {
    // Tham số 2: Các tùy chọn cấu hình Schema tổng thể
    // Sử dụng timestamps để tự động quản lý
    timestamps: true, // Tuỳ chọn này áp dụng cho tất cả các field
  }
);

// Thêm Index để đảm bảo mỗi user không có danh mục trùng tên
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default model<ICategory>("Category", categorySchema);
