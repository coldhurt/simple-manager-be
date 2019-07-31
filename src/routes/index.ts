import * as Router from 'koa-router'
import { loginCtrl, clientCtrl } from '../controllers'
import { needAuth } from '../utils'

const router = new Router()

// client
router.post('/getClientList', needAuth(clientCtrl.findAll))
router.post('/updateClient', needAuth(clientCtrl.update))
router.post('/deleteClient', needAuth(clientCtrl.destroy))
router.post('/addClient', needAuth(clientCtrl.create))

// auth
router.post('/login', loginCtrl.login)
router.post('/logout', loginCtrl.logout)
router.post('/register', loginCtrl.register)
router.post('/changePwd', needAuth(loginCtrl.changePwd))
router.post('/getUserInfo', needAuth(loginCtrl.getUserInfo))

export const routes = router.routes()
