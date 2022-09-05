const cors          = require('cors')
const http          = require('http')
const path          = require('path')
const colors        = require('colors')
const express       = require('express')
const mongoose      = require('mongoose')
const cookieParser  = require('cookie-parser')
require('dotenv').config()

const app           = express()
const httpServer    = http.createServer(app)
const PORT          = process.env.PORT || 5031 //** 5030

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => res.send('NodeJs Jwt BackEnd'))

mongoose.connection.once('open', () => {
    console.log(`\n|-O-|\n\nCONNECTED TO MONGODB\t${colors.gray(new Date())}\n\n`.yellow)
    //** app.listen(PORT, () => console.log(`SERVER IS RUNNUNG ON PORT ${PORT}`))
})

httpServer.listen( PORT, () => {
    console.log(`\n\n|-O-|\n\nSERVER IS RUNNING ON PORT: ${PORT.brightCyan.bold}\t${colors.gray(new Date())}\n`.yellow)
})

mongoose.connection.on('error', err => {
    console.log('MONGOOSE DB CONNECT ERROR')
})
