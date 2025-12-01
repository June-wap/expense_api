import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv/lib/main.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// api route
app.use("/auth", authRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port", process.env.PORT || 5000);
});
