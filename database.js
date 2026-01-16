const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')

db.serialize(() => {
    db.run(`CREATE TABLE users (
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
            )`)
})

async function dbGet(sql, params) {
    return new Promise((resolve, reject) => {
       db.get(sql, params, (err, row) => {
            if (err) reject(err);
            resolve(row);
       }); 
    });
}

module.exports = db