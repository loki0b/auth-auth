import express from "express";
import cookieParser from "cookie-parser";
import usersRouter from "./routes/users.js";

const app = express()
const port = process.env.PORT

app.use(express.json()) // parsing application/json
app.use(cookieParser())
app.use("/api/users", usersRouter);

// Middleware to capture errors
app.use((err, req, res, next) => {
    console.log(err.stack);

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        error: {
            message: message,
            status: status
        }
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})