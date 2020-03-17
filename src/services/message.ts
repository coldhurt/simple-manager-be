import { MYRouter } from '../utils'
import message, { IMessage } from '../models/message'

async function getMessages(ctx: MYRouter) {
  if (ctx.session.user) {
    const { _id } = ctx.session.user
    const { friend_id = '', type = 1 } = ctx.request.body
    let messages: IMessage[] = []
    if (friend_id) {
      let sendMessages = await message.find({
        sender: _id,
        receiver: friend_id,
        type
      })
      let receiveMessages = await message.find({
        sender: friend_id,
        receiver: _id,
        type
      })
      messages = [...sendMessages, ...receiveMessages]
      messages = messages.sort(
        (a, b) => a.get('createdAt') - b.get('createdAt')
      )
    }
    ctx.success({ data: messages })
  } else {
    ctx.failed('getFriends failed, need user_id')
  }
}

export { getMessages }