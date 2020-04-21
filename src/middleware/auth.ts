import admin, { IAdmin } from '../models/admin'
import * as passport from 'koa-passport'
import { encryptPassword } from '../utils'
import { Strategy as LocalStrategy } from 'passport-local'
import * as Koa from 'koa'
function installPassport(app: Koa) {
  admin.findOne({ username: 'admin' }, function (err, testUser) {
    if (!testUser) {
      console.log('test user did not exist; creating test user...')
      testUser = new admin({
        username: 'admin',
        password: encryptPassword('admin'),
      })
      testUser.save()
    }
  })

  passport.serializeUser(function (user: IAdmin, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user: IAdmin, done) {
    done(null, user)
  })

  passport.use(
    new LocalStrategy(function (username, password, done) {
      admin.findOne({ username }, function (err, user) {
        if (err) {
          return done(err)
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' })
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' })
        }
        return done(null, user)
      })
    })
  )
  app.use(passport.initialize()).use(passport.session())
}

export { installPassport }
