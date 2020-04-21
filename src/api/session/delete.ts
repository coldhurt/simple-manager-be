import { delSession } from '../../services/imsession'
import { MYRouter } from '../../utils'

export const post = async (ctx: MYRouter) => {
  const { session_id = '' } = ctx.request.body
  if (ctx.session.passport.user && session_id) {
    const { _id } = ctx.session.passport.user
    const res = delSession(session_id, _id)
    if (res) {
      ctx.success({ data: res })
    } else {
      ctx.failed('delSession failed')
    }
  } else {
    ctx.failed('delSession failed, need session_id')
  }
}

export const needAuth = true
