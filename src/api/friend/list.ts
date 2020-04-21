import { getFriends } from '../../services/friend'
import { MYRouter } from '../../utils'

export const post = async (ctx: MYRouter) => {
  if (ctx.session.passport.user) {
    const { _id } = ctx.session.passport.user
    const data = await getFriends(_id)
    ctx.success({ data })
  } else {
    ctx.failed('get friends failed, need user_id')
  }
}

export const needAuth = true
