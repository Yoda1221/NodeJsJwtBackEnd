const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
    } catch (err) {
        console.log(`DB CONNECT ERROR `, error)
        logEvents('MONGOOSE DB CONNECT ERROR', 'mongoDbLog.txt')
    }
}

module.exports = connectDB
