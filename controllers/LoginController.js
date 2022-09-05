const bcrypt    = require('bcrypt')
const jwt       = require('jsonwebtoken')
const User      = require('../models/User')

const login = async (req, res) => {
    const cookies = req.cookies

    const { userName, password } = req.body
    if (!userName || !password) 
        return res.status(400).json({ message: 'USERNAME AND PASSWORD ARE REQUIRED!' })

    const foundUser = await User.findOne({ userName }).exec()
    if (!foundUser) return res.sendStatus(401) //Unauthorized 
    const match = await bcrypt.compare(password, foundUser.password)
    if (match) {
        const roles = Object.values(foundUser.roles).filter(Boolean)
        const accessToken = jwt.sign({
                "UserInfo": {
                    "userName": foundUser.userName,
                    "roles": roles
                }
            },
            process.env.ACCTOKENSECRET,
            { expiresIn: '10m' }
        )
        const newRefreshToken = jwt.sign(
            { "userName": foundUser.userName },
            process.env.REFTOKENSECRET,
            { expiresIn: '7d' }
        )

        let newRefreshTokenArray =
            !cookies?.jwt
                ? foundUser.refreshToken
                : foundUser.refreshToken.filter(rt => rt !== cookies.jwt)

        if (cookies?.jwt) {
            const refreshToken = cookies.jwt
            const foundToken = await User.findOne({ refreshToken }).exec()

            if (!foundToken) newRefreshTokenArray = []

            res.clearCookie(process.env.COOKIENAME, { 
                httpOnly: true, 
                sameSite: 'None', 
                secure: process.env.COOKIESECURE 
            })
        }

        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken]
        const result = await foundUser.save()
        console.log("🚀 ~ file: LoginController.js ~ line 52 ~ login ~ result", result)

        res.cookie(process.env.COOKIENAME, newRefreshToken, { 
            httpOnly: true, 
            secure: process.env.COOKIESECURE, 
            sameSite: 'None', 
            maxAge: 24 * 60 * 60 * 1000 
        })

        //** SEND ACCESTOKEN CONTAINING userName AND roles
        res.json({ accessToken })
    } else res.sendStatus(401)
}

module.exports = { login } 
