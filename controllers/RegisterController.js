const bcrypt    = require('bcrypt')
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

module.exports = { cerateUser }
