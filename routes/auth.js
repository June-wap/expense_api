import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hashed]
        );

        res.json({ success: true, message: "User created" });

    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: "Email already exists" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1 LIMIT 1",
            [email]
        );

        if (result.rows.length === 0)
            return res.status(400).json({ success: false, message: "User not found" });

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match)
            return res.status(400).json({ success: false, message: "Wrong password" });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        res.json({ success: true, token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;
