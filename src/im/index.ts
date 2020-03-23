import * as socketio from 'socket.io'
import { TKoa } from '..'
import message, { IMessage } from '../models/message'
import { IAdmin } from '../models/admin'
import imsession from '../models/imsession'

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
      if (data && data.receiver && data.message) {
        const options = {
          sender: user && user._id,
          message: data.message,
          receiver: data.receiver,
          type: data.type
        }
        console.log('接受消息', options)
        const model = new message(options)
        await model.save()
        const targetSession = await imsession.findOne({
          user_id: user && user._id,
          friend_id: data.receiver
        })
        if (targetSession) {
          targetSession.lastMessage = model
          await targetSession.save()
        }
        const receiveSession = await imsession.findOne({
          user_id: data.receiver,
          friend_id: user && user._id
        })
        if (receiveSession) {
          receiveSession.lastMessage = model
          await receiveSession.save()
        }
        for (let i = 0; i < users.length; i++) {
          if (data.receiver === users[i].user_id) {
            socket.broadcast.to(users[i].id).emit('receive', model)
            break
          }
        }
        socket.emit('receive', model)
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
  })
  return server
}

export { initIM }
