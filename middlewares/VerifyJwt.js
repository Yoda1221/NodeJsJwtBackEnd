const jwt = require('jsonwebtoken')

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) 
        return res.sendStatus(401).json({ message: 'Unauthorized' })

    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCTOKENSECRET, (err, decoded) => {
            if (err) return res.sendStatus(403).json({ message: 'FORBIDDEN!' }) //** INVALID TOKEN
            req.user    = decoded.UserInfo.userName
            req.roles   = decoded.UserInfo.roles
            next()
        }
    )
}

module.exports = verifyJWT
