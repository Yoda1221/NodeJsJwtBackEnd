const User = require('../models/User')
const asyncHandler  = require('express-async-handler')

const logout = asyncHandler( async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    const refreshToken = cookies.jwt

    const foundUser = await User.findOne({ refreshToken }).exec()
    if (!foundUser) {
        res.clearCookie(process.env.COOKIENAME, { 
            httpOnly: true, 
            sameSite: 'None', 
            secure: process.env.COOKIESECURE 
        })
        return res.sendStatus(204)
    }

    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken)
    const result = await foundUser.save()
    console.log(result)

    res.clearCookie(process.env.COOKIENAME, { 
        httpOnly: true, 
        sameSite: 'None', 
        secure: process.env.COOKIESECURE 
    })
    res.sendStatus(204)
})

module.exports = { logout }
