import { BaseContext } from 'koa'
import * as crypto from 'crypto'
import { config } from '../config'
import * as Router from 'koa-router'

export interface MYRouter extends Router.RouterContext {
  redirectToLogin(): void
  checkLogin(redirectTo: boolean): boolean
  success(obj: Object | String): void
  falied(obj: Object | String): void
}

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
  return async function(ctx: MYRouter) {
    if (ctx.checkLogin(true)) await ctrl(ctx)
  }
}

function contextUtil(ctx: BaseContext) {
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

const log = console.log

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
