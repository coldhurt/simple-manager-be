import message, { IMessage } from '../models/message'
import { getSession } from './imsession'

async function getMessages(user_id: string, session_id: string) {
  session_id = session_id.trim()
  let messages: IMessage[] = []
  const options = {
    limit: 10,
    sort: { createdAt: -1 },
  }
  if (session_id) {
    const session = await getSession(user_id, session_id)
    if (session) {
      messages = await message.find(
        {
          session_id,
        },
        null,
        options
      )
      messages = messages.sort(
        (a, b) => a.get('createdAt') - b.get('createdAt')
      )
      session.unread = 0
      await session.save()
    }
  }
  return messages
}

export { getMessages }
