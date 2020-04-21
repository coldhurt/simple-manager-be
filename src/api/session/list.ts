import { getSessions } from '../../services/imsession'
import { MYRouter } from '../../utils'

export const post = async (ctx: MYRouter) => {
  if (ctx.session.passport.user) {
    const { _id } = ctx.session.passport.user
    try {
      const im_sessions = await getSessions(_id)
      ctx.success({ data: im_sessions })
    } catch (e) {
      ctx.failed(e.message)
    }
  } else {
    ctx.failed('getSessions failed, need login')
  }
}

export const needAuth = true
