import * as crypto from 'crypto'
import { config } from '../config'
import * as Session from 'koa-session'
import chalk from 'chalk'
import * as passport from 'koa-passport'
import { Next, ParameterizedContext } from 'koa'
import { IAdmin } from '../models/admin'

export interface MYState {}
export type MYRouter = ParameterizedContext<
  {
    user: IAdmin
  },
  {
    redirectToLogin(): void
    checkLogin(redirectTo: boolean): boolean
    success(obj: Object | String): void
    failed(obj: Object | String): void
    session: Session.Session | null
    login: Function
    logout(): void
    req: Request & {
      user: IAdmin
    }
  }
>

function success(obj: Object | String) {
  if (typeof obj === 'string')
    this.body = {
      success: true,
      msg: obj
    }
  else
    this.body = {
      success: true,
      ...obj
    }
}

function failed(obj: Object | String) {
  if (typeof obj === 'string')
    this.body = {
      success: false,
      msg: obj
    }
  else
    this.body = {
      success: false,
      ...obj
    }
}

function redirectToLogin() {
  this.redirect('/login')
}

function checkLogin(redirectTo: boolean) {
  if (this.session.id) {
    return true
  } else {
    if (redirectTo) {
      this.redirectToLogin()
    }
    return false
  }
}

// All interfaces that need to be logged in should be wrapped by this function
function needAuth(ctrl: Function) {
  return async function(ctx: MYRouter, next: Next) {
    if (ctx.session.user) {
      await ctrl(ctx)
    } else {
      ctx.failed('need login')
    }
  }
}

function contextUtil(ctx: MYRouter) {
  ctx.success = success
  ctx.failed = failed
  ctx.redirectToLogin = redirectToLogin
  ctx.checkLogin = checkLogin
}

function checkUsername(username: string) {
  return username && /^[\da-zA-z]{5,20}$/g.test(username)
}

function checkPassword(pwd: string) {
  return pwd && /^\S{8,20}$/g.test(pwd)
}

function encryptPassword(pwd: string) {
  const hash = crypto.createHmac('sha256', config.encryptKey)
  return hash.update(pwd).digest('hex')
}

const log = {
  info: function(msg: string) {
    console.log.call(this, chalk.green(Array.prototype.join.call(this, msg)))
  }
}

export {
  needAuth,
  contextUtil,
  redirectToLogin,
  checkLogin,
  checkUsername,
  checkPassword,
  encryptPassword,
  log
}
