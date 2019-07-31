import Admin, { IAdmin } from '../models/admin'
import {
  checkUsername,
  checkPassword,
  encryptPassword,
  MYRouter
} from '../utils'

interface IPwdData {
  oldPwd: string
  newPwd: string
}

async function register(ctx: MYRouter) {
  const body: IAdmin = ctx.request.body
  if (checkUsername(body.username) && checkPassword(body.password)) {
    const data = await Admin.find({ username: body.username })
    if (data && data.length > 0) {
      ctx.failed('has same user')
    } else {
      const newAdmin = new Admin({
        username: body.username,
        password: encryptPassword(body.password)
      })
      const res = await newAdmin.save()
      ctx.success('new admin added')
    }
  } else {
    ctx.failed('username or password is invalid')
  }
}

async function login(ctx: MYRouter) {
  const body: IAdmin = ctx.request.body
  if (checkUsername(body.username) && checkPassword(body.password)) {
    const data = await Admin.findOne({ username: body.username })
    if (data && data.password === encryptPassword(body.password)) {
      ctx.session.id = data._id
      ctx.success('login successfully')
    } else {
      ctx.failed('username or password is not correct')
    }
  } else {
    ctx.failed('username or password is invalid')
  }
}

async function logout(ctx: MYRouter) {
  ctx.session.id = null
  ctx.redirectToLogin()
}

async function changePwd(ctx: MYRouter) {
  const pwdData: IPwdData = ctx.request.body
  const oldAdmin = await Admin.findById(ctx.session.id)
  if (oldAdmin) {
    if (encryptPassword(pwdData.oldPwd) === oldAdmin.password) {
      if (checkPassword(pwdData.newPwd)) {
        oldAdmin.password = encryptPassword(pwdData.newPwd)
        const newData = await oldAdmin.save()
        if (newData) ctx.success('password is changed')
        else ctx.failed('change password failed')
      } else {
        ctx.failed('password is not correct')
      }
    }
  } else {
    ctx.failed('admin not found')
  }
}

async function getUserInfo(ctx: MYRouter) {
  if (ctx.session.id) {
    ctx.success({
      id: ctx.session.id
    })
  } else {
    ctx.failed('getUserInfo failed')
  }
}

const loginCtrl = {
  login,
  register,
  logout,
  changePwd,
  getUserInfo
}
export default loginCtrl
