const bcrypt        = require('bcrypt')
const User          = require('../models/User')
const asyncHandler  = require('express-async-handler')

/**
 ** GET ALL USERS FROM DATABASE
 *
 ** @route  GET     /users
 ** @access Private 
 */
 const getAllUsers = asyncHandler( async (req, res) => {
    const users = await User.find().select('-password').lean()
    console.log('ALL USERS ', users)
    if (!users || !users?.length)
        return res.status(400).json({ message: "NO USERS FOUND!" })

    res.json({ users })
})

/**
 ** GET ONE USER
 *
 ** @route  GET  /users/:id
 ** @access Private 
 */
const getUser = asyncHandler( async (req, res) => {
    if (!req?.params?.id) 
        return res.status(400).json({ message: 'USER ID IS REQUIRED!' })

    const user = await User.findOne({ _id: req.params.id }).exec()
    if (!user) 
        return res.status(204).json({ message: `USER NOT FOUND` })
    
    res.json(user)
})

/**
 ** DELETE USER FROM DATABASE 
 * 
 ** @route  DELETE     /users/:id
 ** @access Private
 */
const deleteUser = asyncHandler( async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ message: 'USER ID IS REQUIRED!' })
    
    const user = await User.findOne({ _id: req.body.id }).exec()
    if (!user) 
        return res.status(204).json({ message: `USER NOT FOUND!` })
    
    const result = await user.deleteOne({ _id: req.body.id })
    res.json(result)
})

module.exports = {
    getAllUsers,
    getUser,
    deleteUser
}
