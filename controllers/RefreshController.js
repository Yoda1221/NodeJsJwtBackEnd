const jwt   = require('jsonwebtoken')
const User  = require('../models/User')
const asyncHandler  = require('express-async-handler')

const refreshToken = asyncHandler( async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.NodeJsJwtBackEnd) return res.sendStatus(401)
    const refreshToken = cookies.jwt
    res.clearCookie(process.env.COOKIENAME, { 
        httpOnly: true, 
        sameSite: 'None', 
        secure: process.env.COOKIESECURE 
    })

    const foundUser = await User.findOne({ refreshToken }).exec()

    if (!foundUser) {
        jwt.verify(refreshToken, process.env.REFTOKENSECRET, async (err, decoded) => {
                if (err) return res.sendStatus(403).json({ message: 'FORBIDDEN!' })
                const hackedUser = await User.findOne({ username: decoded.userName }).exec()
                hackedUser.refreshToken = []
                const result = await hackedUser.save()
                console.log("🚀 ~ file: RefreshController.js ~ line 22 ~ jwt.verify ~ result", result)
            }
        )
        return res.sendStatus(403).json({ message: 'FORBIDDEN!' })
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken)

    jwt.verify(refreshToken, process.env.REFTOKENSECRET, async (err, decoded) => {
            if (err) {
                foundUser.refreshToken = [...newRefreshTokenArray]
                const result = await foundUser.save()
                console.log("🚀 ~ file: RefreshController.js ~ line 34 ~ jwt.verify ~ result", result)
            }
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403).json({ message: 'FORBIDDEN!' })

            const roles = Object.values(foundUser.roles)
            const accessToken = jwt.sign({
                    "UserInfo": {
                        "userName": decoded.userName,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '10s' }
            )

            const newRefreshToken = jwt.sign(
                { "userName": foundUser.userName },
                process.env.REFTOKENSECRET,
                { expiresIn: '15s' }
            )
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
            const result = await foundUser.save()
            console.log("🚀 ~ file: RefreshController.js ~ line 56 ~ jwt.verify ~ result", result)

            res.cookie(process.env.COOKIENAME, newRefreshToken, { 
                httpOnly: true, 
                secure: process.env.COOKIESECURE , 
                sameSite: 'None', 
                maxAge: 24 * 60 * 60 * 1000 
            })

            res.json({ accessToken })
        }
    )
})

module.exports = { refreshToken }
