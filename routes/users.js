import { dbGet, dbRun } from '../database';

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const db = require('../database');
const middleware = require("../middleware");

const router = express.Router();
const saltRounds = 10;

router.get("/profile", middleware, (req, res) => {
    db.get("SELECT * FROM users WHERE username = ?", [req.user], (err, row) => {
        if (err) return res.status(500).json({ error: "Server Error" });

        const { username, password } = row;
        res.status(200).json({ username: username });
    })
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

router.post("/login", (req, res) => {;
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {;
        if (err) return res.status(500).json({ error: "Server Error" });
        if (!row) return res.status(404).json({ error: "user not found" });
        
        bcrypt.compare(password, row.password, (compareErr, result) => {;
            if (compareErr) return res.status(500).json({ error: "Server Error"});

            if (result) {
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
            }
            else return res.status(401).json({ status: "Incorrect Password" });
        });
    });
});

router.post("/logout", middleware, (req, res) => {
    res.clearCookie("auth_token").status(200).json({ status: "Logout Successfully" });
})

module.exports = router