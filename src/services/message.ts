import { MYRouter } from '../utils'
import message, { IMessage } from '../models/message'
import imsession from '../models/imsession'

async function getMessages(ctx: MYRouter) {
  if (ctx.session.user) {
    const { _id } = ctx.session.user
    let { session_id = '' } = ctx.request.body
    session_id = session_id.trim()
    let messages: IMessage[] = []
    const options = {
      limit: 10,
      sort: { createdAt: -1 }
    }
    if (session_id) {
      // let sendMessages = []
      // let receiveMessages: IMessage[] = []
      // sendMessages = await message.find(
      //   {
      //     sender: _id,
      //     receiver: friend_id,
      //     type
      //   },
      //   null,
      //   options
      // )
      // if (_id !== friend_id)
      //   receiveMessages = await message.find(
      //     {
      //       sender: friend_id,
      //       receiver: _id,
      //       type
      //     },
      //     null,
      //     options
      //   )
      // messages = [...sendMessages, ...receiveMessages]
      messages = await message.find(
        {
          session_id
        },
        null,
        options
      )
      messages = messages.sort(
        (a, b) => a.get('createdAt') - b.get('createdAt')
      )
      const session = await imsession.findById(session_id)
      if (session) {
        session.unread = 0
        await session.save()
      }
    }
    ctx.success({ data: messages })
  } else {
    ctx.failed('getMessages failed, need user_id')
  }
}

export { getMessages }
