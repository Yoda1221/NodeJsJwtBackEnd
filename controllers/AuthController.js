const bcrypt    = require('bcrypt')
const jwt       = require('jsonwebtoken')
const User      = require('../models/User')
const asyncHandler  = require('express-async-handler')

const cerateUser = asyncHandler( async (req, res) => {
    const { userName, password } = req.body
    if (!userName || !password) return res.status(400).json({ 'message': 'Username and password are required.' })

    const duplicate = await User.findOne({ userName }).exec()
    if (duplicate) return res.sendStatus(409) //Conflict 

    try {
        const hashedPwd = await bcrypt.hash(password, 10)
        const result    = await User.create({
            "userName": userName,
            "password": hashedPwd
        })
        console.log("🚀 ~ file: RegisterController.js ~ line 21 ~ cerateUser ~ result", result)

        res.status(201).json({ 'success': `New user ${userName} created!` })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})
const login = asyncHandler( async (req, res) => {
    const cookies = req.cookies
    const { userName, password } = req.body

    if (!userName || !password) 
        return res.status(400).json({ message: 'USERNAME AND PASSWORD ARE REQUIRED!' })

    const foundUser = await User.findOne({ userName }).exec()

    if (!foundUser) return res.sendStatus(401).json({ message: 'Unauthorized' })

    const match = await bcrypt.compare(password, foundUser.password)
    
    if (match) {
        const roles = Object.values(foundUser.roles).filter(Boolean)
        console.log('FUR ', foundUser.roles)
        const accessToken = jwt.sign({
                "UserInfo": {
                    "userName": foundUser.userName,
                    "roles": foundUser.roles
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
                
        let newRefreshTokenArray = !cookies?.NodeJsJwtBackEnd
            ? foundUser.refreshToken
            : foundUser.refreshToken.filter(rt => rt !== cookies.NodeJsJwtBackEnd)

        if (cookies?.NodeJsJwtBackEnd) {
            const refreshToken = cookies.NodeJsJwtBackEnd
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
})
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

module.exports = { cerateUser, login, logout, refreshToken } 
