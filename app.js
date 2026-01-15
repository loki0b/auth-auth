const express = require('express')
const cookieParser = require("cookie-parser")
const usersRoutes = require("./routes/users")

const app = express()
const port = process.env.PORT

app.use(express.json()) // parsing application/json
app.use(cookieParser())
app.use("/api/users", usersRoutes)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})