const express           = require('express')
const router            = express.Router()
const ROLES_LIST        = require('../config/rolesList')
const verifyRoles       = require('../middlewares/VerifyRoles')
const UsersController   = require('../controllers/UserController')

router.route('/')
    .get(UsersController.getAllUsers)

router.route('/:id')
    .get(verifyRoles(ROLES_LIST.Admin), UsersController.getUser)
    .delete(verifyRoles(ROLES_LIST.Admin), UsersController.deleteUser) 

module.exports = router
