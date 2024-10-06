const path = require('path')
require('dotenv').config()
const express = require('express')
const compression = require('compression')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const { default: mongoose } = require('mongoose')

const app = express()

app.use('/assets', express.static(path.join(__dirname, '../public/assets')))
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true,
        limit: '30mb',
    })
)

app.use(cookieParser())

// init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

// init db


mongoose
    .connect('mongodb://0.0.0.0:27017/dbhung')
    .then(() => console.log('Success'))
    .catch((err) => console.log(err))


// router
app.get('/ping', (req, res) => {
    res.json({
        message: 'PONG PONG',
    })
})

app.use('/v1/api', require('./routes'))

app.use((req, res, next) => {
    const error = new Error('Not found!')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
        // stack: error.stack,
    })
})

module.exports = app
