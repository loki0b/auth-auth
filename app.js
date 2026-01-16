import express from "express";
import cookieParser from "cookie-parser";
import usersRouter from "./routes/users.js";

const app = express()
const port = process.env.PORT

app.use(express.json()) // parsing application/json
app.use(cookieParser())
app.use("/api/users", usersRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})