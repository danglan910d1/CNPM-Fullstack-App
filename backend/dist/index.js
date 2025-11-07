import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// gắn user routes
app.use("/users", userRoutes);
// MongoDB connect
mongoose.connect(process.env.MONGO_URI || "")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error(err));
// Simple route
app.get("/", (req, res) => {
    res.send("Hello from Express + MongoDB + TypeScript!");
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//# sourceMappingURL=index.js.map