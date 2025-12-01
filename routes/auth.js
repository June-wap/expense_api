import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        // check email exists
        const check = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (check.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // hash password
        const hashed = await bcrypt.hash(password, 10);

        // insert new user
        await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hashed]
        );

        res.json({
            success: true,
            message: "User created"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
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

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Wrong password"
            });
        }

        // generate token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Login success",
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;
