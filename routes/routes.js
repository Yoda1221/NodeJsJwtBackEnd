const express   = require('express')
const router    = express.Router()
const path      = require('path')
const ROLES_LIST        = require('../config/rolesList')
const verifyRoles       = require('../middlewares/VerifyRoles')
const UsersController   = require('../controllers/UserController')

router.get('^/$| /index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})


/* router.route('/users/')
    .get(UsersController.getAllUsers)

router.route('/users/:id')
    .get(verifyRoles(ROLES_LIST.Admin), UsersController.getUser)
    .delete(verifyRoles(ROLES_LIST.Admin), UsersController.deleteUser)  */




module.exports = router
