const express = require('express')
const jwt = require("jsonwebtoken")
const db = require('./database')

const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10

router.post("/register", (req, res) => {
    const { username, password } = req.body

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: "Server Error" })  

        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)'
        db.run(sql, [username, hashedPassword], (dbErr) => {
            if (dbErr) return res.status(500).json({ error: "Server Error" })
            
            return res.status(200).json({ status: "Account Successful Created"})
        })
    })
})

router.post("/login", (req, res) => {
    const { username, password } = req.body

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.status(500).json({ error: "Server Error" })
        if (!row) return res.status(404).json({ error: "user not found" })
        
        bcrypt.compare(password, row.password, (compareErr, result) => {
            if (compareErr) return res.status(500).json({ error: "Server Error"})

            if (result) {
                const token = jwt.sign(
                    { sub: row.username },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                )
                
                return res.status(200).cookie("auth_token", token).json({ status: "Login Successful"})
            }
            else return res.status(200).json({ status: "Incorrect Password" })             
        })
    })
})

module.exports = router