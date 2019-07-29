import * as Koa from 'koa'
import * as Helmet from 'koa-helmet'
import * as Static from 'koa-static'
import * as Logger from 'koa-logger'
import * as BodyParser from 'koa-bodyparser'
import * as Mongoose from 'mongoose'
import * as path from 'path'
import * as Session from 'koa-session'

import { config } from './config'
// import { logger } from './logging'
import { routes } from './routes'
import { contextUtil } from './utils'

const app = new Koa()

app.keys = config.sessionKeys

Mongoose.connect('mongodb://localhost:27017/myproject', {
  useNewUrlParser: true
})

const db: Mongoose.Connection = Mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  // we're connected!
  console.log('mongoose connected')
})

contextUtil(app.context)

const sessionConfig = {
  key: 'koa:sess' /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true /** (boolean) automatically commit headers (default true) */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew: false /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}
app
  .use(Helmet())
  .use(Session(sessionConfig, app))
  .use(
    BodyParser({
      enableTypes: ['json'],
      jsonLimit: '5mb',
      strict: true,
      onerror: function(err, ctx) {
        ctx.throw('body parse error', 422)
      }
    })
  )
  .use(async (ctx, next) => {
    // redirect all gets to front end
    if (ctx.request.method === 'GET') {
      ctx.request.path = '/'
    }
    await next()
  })
  .use(Static(path.join(__dirname, '../build')))

console.log('log status: ', config.prettyLog)
if (config.prettyLog) {
  app.use(Logger())
}
app.use(routes)
// # customize logger
// app.use(logger)

app.listen(config.port)

console.log(`Server running on port ${config.port}`)
