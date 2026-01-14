const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

db.serialize(() => {
    db.run(`CREATE TABLE users (
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
            )`)
})

module.exports = db