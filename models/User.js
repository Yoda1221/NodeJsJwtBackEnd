const mongoose  = require('mongoose')

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        User: {
            type: Number,
            default: 2001
        },
        Editor: {
            Number
        },
        Admin: {
            Number
        }
    }],
    refreshToken: [String]
})

module.exports = mongoose.model('User', userSchema)
