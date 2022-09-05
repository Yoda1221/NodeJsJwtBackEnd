const fs            = require('fs')
const fsPromises    = fs.promises
const { v4: uuid }  = require('uuid')
const path          = require('path')
const { format }    = require('date-fns')

const logEvents = async (message, logName) => {
    const dateTime  = `${format(new Date(), 'dd-MM-yyyy HH:mm:ss')}`
    const logItem   = `${dateTime}\t${uuid()}\t${message}\n`

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs')))
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))

        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logName), logItem)
    } catch (err) { console.error('LOG EVENTS ERROR: ', err) }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt')
    next()
}

module.exports = { logger, logEvents }
