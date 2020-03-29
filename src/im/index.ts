import * as socketio from 'socket.io'
import { TKoa } from '..'
import message, { IMessage } from '../models/message'
import { IAdmin } from '../models/admin'
import imsession from '../models/imsession'
import { MessageType } from './types'

type TSocket = {
  id: string
  user_id: string
}

function initIM(app: TKoa) {
  const server = require('http').Server(app.callback())
  const io = socketio(server)
  const users: TSocket[] = []
  io.on('connection', async socket => {
    const cookie = socket.request.headers.cookie
    const sessKey = app.context.getCookie(cookie, 'koa:sess')
    if (!sessKey) {
      socket.disconnect()
      return
    }
    console.log('sesskey ', sessKey)
    const data = await app.context.store.get(sessKey, 86400000, {
      rolling: false
    })
    if (!data.user) {
      socket.error('need login')
      socket.disconnect()
      return
    }
    users.push({
      id: socket.id,
      user_id: data.user._id
    })
    const user = data.user as IAdmin
    console.log('socketio connected 用户信息', {
      _id: user._id,
      nickname: user.nickname,
      username: user.username
    })
    socket.on('send', async (data: IMessage) => {
      const { session_id } = data

      if (session_id) {
        const session = await imsession.findById(session_id)
        console.log('发送消息', data)
        if (session) {
          const model = new message({
            session_id,
            send: true,
            message: data.message
          })
          await model.save()

          socket.emit('receive', {
            type: MessageType.MESSAGE_RECEIVE,
            session_id,
            data: model
          })

          const { friend_id } = session

          let friend_session = await imsession.findOne({
            user_id: friend_id,
            friend_id: user._id
          })
          if (!friend_session) {
            friend_session = new imsession({
              user_id: friend_id,
              friend_id: user._id
            })
            await friend_session.save()
          }
          if (friend_session) {
            friend_session.unread += 1
            const new_message = new message({
              session_id: friend_session._id,
              send: false,
              message: data.message
            })
            await new_message.save()
            friend_session.lastMessage = new_message
            await friend_session.save()

            for (let i = 0; i < users.length; i++) {
              if (friend_id === users[i].user_id) {
                socket.broadcast.to(users[i].id).emit('receive', {
                  type: MessageType.MESSAGE_RECEIVE,
                  session_id: friend_session._id,
                  data: new_message
                })
                break
              }
            }
          }
        }
      }
    })

    socket.on('disconnect', () => {
      for (let i = 0; i < users.length; i++) {
        if (socket.id === users[i].id) {
          users.splice(i, 1)
          break
        }
      }
    })

    socket.on('fetch', res => {
      console.log(res)
    })
  })
  return server
}

export { initIM }
