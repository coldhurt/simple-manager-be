import Admin, { IAdmin } from '../models/admin'
import {
  checkUsername,
  checkPassword,
  encryptPassword,
  MYRouter,
  mapKeys,
  checkNickName
} from '../utils'
import * as passport from 'koa-passport'
import { Next } from 'koa'
import * as path from 'path'

interface IPwdData {
  oldPwd: string
  newPwd: string
}

const adminKeys = ['_id', 'username', 'nickname', 'avatar', 'createdAt']

async function register(ctx: MYRouter) {
  const body: IAdmin & { confirmPassword: string } = ctx.request.body
  const { username, password, confirmPassword } = body
  const nickname = username
  if (checkUsername(username) && checkPassword(password)) {
    if (password !== confirmPassword) {
      ctx.failed('Password is not same to confirmPassword')
      return
    }
    const data = await Admin.find({ username })
    if (data && data.length > 0) {
      ctx.failed('has same user')
      return
    }
    // if (!checkNickName(nickname)) {
    //   ctx.failed('Nickname is invalid ')
    //   return
    // }
    const newAdmin = new Admin({
      username,
      nickname,
      password: encryptPassword(password)
    })
    await newAdmin.save()
    ctx.success(newAdmin)
  } else {
    ctx.failed('username or password is invalid')
  }
}

const login = async function(ctx: MYRouter, next: Next) {
  return passport.authenticate('local', async function(
    err,
    user,
    info,
    status
  ) {
    if (user === false) {
      ctx.failed('username or password is not correct')
    } else {
      ctx.session.user = user
      ctx.success('login successfully')
    }
  })(ctx, next)
}

async function logout(ctx: MYRouter) {
  ctx.session.user = null
  ctx.logout()
  console.log(ctx.logout)
  ctx.redirectToLogin()
}

type userinfo = {
  nickname?: string
}

async function updateUserInfo(ctx: MYRouter) {
  if (ctx.session.user) {
    const data: userinfo = ctx.request.body
    console.log(data)
    if (data) {
      const { nickname } = data
      if (nickname && checkNickName(nickname)) {
        const model = await Admin.findById(ctx.session.user._id)
        if (model) {
          model.nickname = nickname
          const res = await model.save()
          ctx.success({ data: model })
        } else {
          ctx.failed('need login', 401)
        }
      } else {
        ctx.failed('invalid params')
      }
    } else {
      ctx.failed('invalid params')
    }
  } else {
    ctx.failed('need login', 401)
  }
}

async function setAvatar(ctx: MYRouter) {
  if (ctx.session.user) {
    const files = ctx.request.files
    const keys = Object.keys(files)
    if (keys.length > 0) {
      console.log(files[keys[0]])
      const avatar = files[keys[0]]
      if (avatar) {
        const basename = path.basename(avatar.path)
        if (basename.endsWith('.jpg') || basename.endsWith('.png')) {
          const model = await Admin.findById(ctx.session.user._id, {
            avatar: true
          })
          if (model) {
            model.avatar = `/upload/${basename}`
            const res = await model.save()
            ctx.success({ data: model })
            return
          }
        }
      }
    }
    ctx.failed('upload error')
  } else {
    ctx.failed('need login', 401)
  }
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
  if (ctx.session.user) {
    const model = await Admin.findById(ctx.session.user._id)
    ctx.success({
      data: model
    })
  } else {
    ctx.failed('getUserInfo failed')
  }
}

async function getUserList(ctx: MYRouter) {
  const { nickname } = ctx.request.body
  if (nickname) {
    const users = await Admin.find(
      {
        nickname: {
          $regex: nickname
        }
      },
      adminKeys
    )
    ctx.success({ data: users })
  } else {
    ctx.failed('Only support search by id')
  }
}

async function destroy(ctx: MYRouter) {
  const count = await Admin.count({})
  if (count > 1) {
    const id = ctx.request.body.id
    const admin = await Admin.findById(id)

    // Delete client from database and return deleted object as reference
    if (admin) {
      const deleteAdmin = await admin.remove()
      ctx.success({ data: deleteAdmin })
    } else {
      ctx.failed({
        msg: 'Admin not found'
      })
    }
  } else {
    ctx.failed('You cant delete the only one account')
  }
}

const adminService = {
  login,
  register,
  logout,
  changePwd,
  getUserInfo,
  getUserList,
  destroy,
  updateUserInfo,
  setAvatar
}
export default adminService
