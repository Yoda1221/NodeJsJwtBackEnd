const express           = require('express')
const router            = express.Router()
const LoginController   = require('../controllers/LoginController')
const LogoutController  = require('../controllers/LogoutController')
const RefreshController = require('../controllers/RefreshController')
const RegisterController = require('../controllers/RegisterController')

router.route('/').post(LoginController.login)
router.route('/').get(LogoutController.logout)
router.route('/refresh').get(RefreshController.refreshToken)
router.route('/newUser').post(RegisterController.cerateUser)

module.exports = router
