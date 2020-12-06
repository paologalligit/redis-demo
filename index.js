const express = require('express')
const pool = require('./db/connect')
const redis = require("redis")
const { response } = require('express')
const client = redis.createClient('redis://redis')
const morgan = require('morgan')

const app = express()
app.use(express.urlencoded())
app.use(express.json())

app.get('/', (req, res, next) => {
    res.send('EVERYTHING WORKING FINE!')
})

app.post('/user', (req, res, next) => {
    const { name, age, country } = req.body

    if (!name) res.json({ error: 'You must specify the name!' })

    const queryString = `INSERT INTO users (name, age, country) VALUES ('${name}', ${age}, ${country}) RETURNING id`

    pool.query(queryString)
        .then(response => {
            console.log('the response. ', response)
            client.set(response.rows[0].id, JSON.stringify({ name, age, country }), function (err, cache) {
                if (err) console.error('the err: ', err)
                console.log('the cache: ', cache)

                res.json({ status: 'ok', rowCount: response.rowCount, insertions: response.rows })
            })
        })
        .catch(error => res.json(error))
})

app.get('/user', (req, res, next) => {
    client.get('users', function (err, hit) {
        if (err) console.log('ERROR: ', err)
        if (hit) {

        } else {
            console.log('miss: ')
            let queryString = `SELECT * FROM users`

            pool.query(queryString)
                .then(queryRes => res.json(queryRes.rows))
                .catch(err => res.json({ error: err }))
        }
    })
})

app.get('/user/:id', (req, res, next) => {
    const { id } = req.params

    client.get(id, function (err, hit) {
        if (hit) {
            console.log('HIT! :)')
            res.json(JSON.parse(hit))
        } else {
            console.log('MISS... :(')
            let queryString = `SELECT * FROM users WHERE id = ${id}`

            pool.query(queryString)
                .then(queryRes => res.json(queryRes.rows))
                .catch(err => res.json({ error: err }))
        }
    })
})

app.listen(8000, () => {
    console.log('listening to port 8000...')
})