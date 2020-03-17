import * as Koa from 'koa'
import * as Helmet from 'koa-helmet'
import * as Static from 'koa-static'
import * as Logger from 'koa-logger'
import * as BodyParser from 'koa-bodyparser'
import * as Mongoose from 'mongoose'
import * as path from 'path'
import * as Session from 'koa-session'
import * as passport from 'koa-passport'
import * as RedisStore from 'koa-redis'
import * as redis from 'redis'
import { config } from './config'
import { routes } from './routes'
import { contextUtil, log, MYRouter, MYState } from './utils'
import { installSession } from './middleware/session'
import { installPassport } from './middleware/auth'
import { initIM } from './im'

export type TKoa = Koa<MYState, MYRouter>
const app = new Koa<MYState, MYRouter>()

app.keys = config.sessionKeys

Mongoose.connect(config.mongodbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = Mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  // we're connected!
  log.info('mongoose connected')
})

contextUtil(app.context as MYRouter)
installSession(app)
app.use(Helmet()).use(
  BodyParser({
    enableTypes: ['json'],
    jsonLimit: '5mb',
    strict: true,
    onerror: function(err, ctx) {
      ctx.throw('body parse error', 422)
    }
  })
)
installPassport(app)
app
  .use(async (ctx, next) => {
    // redirect all gets to front end
    if (ctx.request.method === 'GET' && ctx.request.path.indexOf('.') === -1) {
      ctx.request.path = '/'
    }
    await next()
  })
  .use(Static(path.join(__dirname, '../build')))

log.info(`log status: ${config.prettyLog}`)
if (config.prettyLog) {
  app.use(Logger())
}
app.use(routes)
const server = initIM(app)
server.listen(config.port)

log.info(`Server running on port ${config.port}`)
