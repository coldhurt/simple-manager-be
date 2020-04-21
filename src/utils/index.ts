import * as crypto from 'crypto'
import { config } from '../config'
import * as Session from 'koa-session'
import chalk from 'chalk'
import { Next, ParameterizedContext, Context } from 'koa'
import { IAdmin } from '../models/admin'
import redisStore = require('koa-redis')

export interface MYState {}
export type MYRouter = ParameterizedContext<
  {
    user: IAdmin
  },
  {
    redirectToLogin(): void
    checkLogin(redirectTo: boolean): boolean
    success(obj: Object | String): void
    failed(obj: Object | String, code?: number): void
    session: Session.Session | null
    login: Function
    logout(): void
    req: Request & {
      user: IAdmin
    }
    store: redisStore.RedisSessionStore
    getCookie(cookie: string, key: string): string
  } & Context
>

function success(obj: Object | String) {
  if (typeof obj === 'string')
    this.body = {
      success: true,
      msg: obj,
    }
  else
    this.body = {
      success: true,
      ...obj,
    }
}

function failed(obj: Object | String, code = 403) {
  if (typeof obj === 'string')
    this.body = {
      success: false,
      msg: obj,
      code,
    }
  else
    this.body = {
      success: false,
      code,
      ...obj,
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
  return async function (ctx: MYRouter, next: Next) {
    // console.log(ctx.session)
    if (ctx.isAuthenticated()) {
      await ctrl(ctx)
    } else {
      ctx.failed('need login', 401)
    }
  }
}

function contextUtil(ctx: MYRouter) {
  ctx.success = success
  ctx.failed = failed
  ctx.redirectToLogin = redirectToLogin
  ctx.checkLogin = checkLogin
  ctx.getCookie = getCookie
}

function checkUsername(username: string) {
  return username && /^[\da-zA-z]{5,20}$/g.test(username)
}

function checkNickName(nickname: string) {
  return nickname && /^[\da-zA-z\u4e00-\u9fa5]{2,}$/g.test(nickname)
}

function checkPassword(pwd: string) {
  return pwd && /^\S{8,30}$/g.test(pwd)
}

function encryptPassword(pwd: string) {
  const hash = crypto.createHmac('sha256', config.encryptKey)
  return hash.update(pwd).digest('hex')
}

const log = {
  info: function (msg: string) {
    console.log.call(this, chalk.green(Array.prototype.join.call(this, msg)))
  },
}

function getCookie(cookie: string, key: string) {
  if (cookie.startsWith('cookie:')) {
    cookie = cookie.substr(7)
  }
  const arr = cookie.split(';')
  const obj: Record<string, string> = {}
  for (const i of arr) {
    const items = i.trim().split('=')
    obj[items[0]] = items[1]
  }
  return obj[key]
}

function mapKeys(obj: Record<string, any>, keys: string[]) {
  const res: Record<string, any> = {}
  for (const key of keys) {
    res[key] = obj[key]
  }
  return res
}

export {
  needAuth,
  contextUtil,
  redirectToLogin,
  checkLogin,
  checkUsername,
  checkNickName,
  checkPassword,
  encryptPassword,
  log,
  getCookie,
  mapKeys,
}
