import admin, { IAdmin } from '../models/admin'
import * as passport from 'koa-passport'
import { encryptPassword } from '.'
import { Strategy as LocalStrategy } from 'passport-local'

admin.findOne({ username: 'admin' }, function(err, testUser) {
  if (!testUser) {
    console.log('test user did not exist; creating test user...')
    testUser = new admin({
      username: 'admin',
      password: encryptPassword('admin')
    })
    testUser.save()
  }
})

passport.serializeUser(function(user: IAdmin, done) {
  done(null, user._id)
})

passport.deserializeUser(function(id, done) {
  admin.findById(id, done)
})

passport.use(
  new LocalStrategy(function(username, password, done) {
    admin.findOne({ username }, function(err, user) {
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
