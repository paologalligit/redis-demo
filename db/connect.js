const { Pool, Client } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'postgres',
    database: 'mydb',
    password: 'mypass',
    port: 5432
})

module.exports = pool