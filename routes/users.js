import express from "express";
import { hash, compare } from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { dbGet, dbRun } from "../database.js";
import middleware from "../middleware.js";

const usersRouter = express.Router();
const saltRounds = 10;

usersRouter.get("/profile", middleware, async (req, res) => {
    try {
        const sql = "SELECT * FROM users WHERE username = ?";
        const row = await dbGet(sql, [req.user]);

        const { username } = row;

        return res.status(200).json({ username: username });
    } catch (err) {
        return res.status(500).json({ error: "Server Error" });
    }
});

usersRouter.post("/register", async (req, res) => {;
    const { username, password } = req.body;

    try {
        const hashedPassword = await hash(password, saltRounds);
        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";

        await dbRun(sql, [username, hashedPassword]); 

        return res.status(200).json({ status: "Account Successful Created"});
    } catch(err) {
       return res.status(500).json({ error: "Server Error" }); 
    }
});

usersRouter.post("/login", async (req, res) => {;
    const { username, password } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE username = ?";
        const row = await dbGet(sql, [username]);

        if (!row) return res.status(404).json({ error: "user not found" });
        
        const equal = await compare(password, row.password);
        if (!equal) return res.status(401).json({ status: "Incorrect Password" });

        const token = jsonwebtoken.sign(
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

usersRouter.post("/logout", middleware, (req, res) => {
    res.clearCookie("auth_token").status(200).json({ status: "Logout Successfully" });
})

export default usersRouter;