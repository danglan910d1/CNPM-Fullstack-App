// src/models/User.ts
import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=User.js.map