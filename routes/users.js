import { dbGet, dbRun } from '../database';

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const db = require('../database');
const middleware = require("../middleware");

const router = express.Router();
const saltRounds = 10;

router.get("/profile", middleware, async (req, res) => {
    try {
        const sql = "SELECT * FROM users WHERE username = ?";
        const row = await dbGet(sql, [req.user]);

        const { username } = row;

        return res.status(200).json({ username: username });
    } catch (err) {
        return res.status(500).json({ error: "Server Error" });
    }
});

router.post("/register", async (req, res) => {;
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

        await dbRun(sql, [username, hashedPassword]); 

        return res.status(200).json({ status: "Account Successful Created"});
    } catch(err) {
       return res.status(500).json({ error: "Server Error" }); 
    }
});

router.post("/login", async (req, res) => {;
    const { username, password } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE username = ?";
        const row = await dbGet(sql, [username]);

        if (!row) return res.status(404).json({ error: "user not found" });
        
        const equal = await bcrypt.compare(password, row.password);
        if (!equal) return res.status(401).json({ status: "Incorrect Password" });

        const token = jwt.sign(
                    { sub: row.username },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                )
                
        const cookieOptions = {
            httpOnly: true,
            maxAge: 60 * 60 * 1000, // 1h to ms
            sameSite: "strict"
        }

        return res.status(200).cookie("auth_token", token, cookieOptions).json({ status: "Login Successful"});
    } catch (err) {
        return res.status(500).json({ error: "Server Error" });
    }
});

router.post("/logout", middleware, (req, res) => {
    res.clearCookie("auth_token").status(200).json({ status: "Logout Successfully" });
})

module.exports = router