import { MYRouter } from '../utils'
import message, { IMessage } from '../models/message'

async function getMessages(ctx: MYRouter) {
  if (ctx.session.user) {
    const { _id } = ctx.session.user
    let { friend_id = '', type = 1 } = ctx.request.body
    friend_id = friend_id.trim()
    let messages: IMessage[] = []
    const options = {
      limit: 10,
      sort: { createdAt: -1 }
    }
    if (friend_id) {
      let sendMessages = []
      let receiveMessages: IMessage[] = []
      sendMessages = await message.find(
        {
          sender: _id,
          receiver: friend_id,
          type
        },
        null,
        options
      )
      if (_id !== friend_id)
        receiveMessages = await message.find(
          {
            sender: friend_id,
            receiver: _id,
            type
          },
          null,
          options
        )
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
