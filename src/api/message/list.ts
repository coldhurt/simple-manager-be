import { getMessages } from '../../services/message'
import { MYRouter } from '../../utils'
import { IMessage } from '../../models/message'

export const post = async (ctx: MYRouter) => {
  if (ctx.isAuthenticated()) {
    const { _id } = ctx.session.passport.user
    let { session_id = '' } = ctx.request.body
    session_id = session_id.trim()
    const messages: IMessage[] = await getMessages(_id, session_id)
    ctx.success({ data: messages })
  } else {
    ctx.failed('getMessages failed, need login')
  }
}

export const needAuth = true
