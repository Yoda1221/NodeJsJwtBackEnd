const cors          = require('cors')
const http          = require('http')
const path          = require('path')
const colors        = require('colors')
const express       = require('express')
const mongoose      = require('mongoose')
const cookieParser  = require('cookie-parser')
const corsOptions   = require('./config/corsOptions')
const dbConnect     = require('./config/dbConn')
const errorHandler  = require('./middlewares/ErrorHandler')
const { 
    logEvents, 
    logger 
}                   = require('./middlewares/logEvents')
require('dotenv').config()

const app           = express()
const httpServer    = http.createServer(app)
const PORT          = process.env.PORT || 5031 //** 5030

dbConnect()

app.use(logger)
app.use(errorHandler)
app.use(cors()) // Cross Origin Resource Sharing
app.use(express.json())
app.use(cookieParser())
app.use('/', require('./routes/routes'))
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/usersRoutes'))
app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => res.send('NodeJs Jwt BackEnd!'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

mongoose.connection.once('open', () => {
    console.log(`\n|-O-|\n\nCONNECTED TO MONGODB\t${colors.gray(new Date())}\n\n`.yellow)
    //** app.listen(PORT, () => console.log(`SERVER IS RUNNUNG ON PORT ${PORT}`))
})

httpServer.listen( PORT, () => {
    logEvents(`SERVER IS RUNNING ON PORT: ${PORT}`, 'serverRunLog.txt')
    console.log(`\n\n|-O-|\n\nSERVER IS RUNNING ON PORT: ${PORT.brightCyan.bold}\t${colors.gray(new Date())}\n`.yellow)
})

mongoose.connection.on('error', err => {
    console.log('MONGOOSE DB CONNECT ERROR')
    logEvents('MONGOOSE DB CONNECT ERROR', 'mongoDbLog.txt')
})
