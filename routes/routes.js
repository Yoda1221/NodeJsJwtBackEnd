const express   = require('express')
const router    = express.Router()
const path      = require('path')
const ROLES_LIST        = require('../config/rolesList')
const verifyRoles       = require('../middlewares/VerifyRoles')
const UsersController   = require('../controllers/UserController')
// TODO CREATE AN AuthController.js
const AuthController    = require('../controllers/AuthController')
const LoginController   = require('../controllers/LoginController')
const LogoutController  = require('../controllers/LogoutController')
const RefreshController = require('../controllers/RefreshController')
const RegisterController = require('../controllers/RegisterController')

router.get('^/$| /index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})


router.route('/auth/').post(AuthController.login)
router.route('/auth/').get(AuthController.logout)
router.route('/auth/refresh').get(AuthController.refreshToken)
router.route('/auth/newUser').post(RegisterController.cerateUser)


router.route('/users/')
    .get(UsersController.getAllUsers)

router.route('/users/:id')
    .get(verifyRoles(ROLES_LIST.Admin), UsersController.getUser)
    .delete(verifyRoles(ROLES_LIST.Admin), UsersController.deleteUser) 




module.exports = router
