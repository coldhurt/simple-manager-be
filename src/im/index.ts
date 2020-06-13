import * as socketio from 'socket.io'
import { TKoa } from '..'
import message, { IMessage } from '../models/message'
import { IAdmin } from '../models/admin'
import imsession from '../models/imsession'
import { MessageType, FetchData } from './types'
import { getFriends, getFriendIds } from '../services/friend'
import { delSession, addSession, getSessions } from '../services/imsession'
import { getMessages } from '../services/message'

type TSocket = {
  id: string
  user_id: string
}

function needLogin(socket: SocketIO.Socket) {
  console.error('need login')
  socket.emit('err', {
    type: MessageType.ERROR_NEED_LOGIN,
  })
  // socket.disconnect()
}

function initIM(app: TKoa) {
  const server = require('http').Server(app.callback())
  const io = socketio(server)
  const users: Record<string, TSocket> = {}

  async function findFriendIdBySessionId(
    session_id: string,
    userID: string,
    socket: SocketIO.Socket
  ) {
    const session = await imsession.findById(session_id)
    if (session) {
      const friends = await getFriendIds(session.friend_id)
      if (!friends.includes(userID)) {
        socket.error('你不是对方的好友')
        return
      }
      // const model = new message({
      //   session_id,
      //   send: true,
      //   message: data.message,
      // })
      // await model.save()
      // session.lastMessage = model
      // await session.save()

      // socket.emit('receive', {
      //   type: MessageType.MESSAGE_RECEIVE,
      //   session_id,
      //   data: model,
      // })

      const { friend_id } = session

      let friend_session = await imsession.findOne({
        user_id: friend_id,
        friend_id: userID,
      })
      if (!friend_session) {
        friend_session = new imsession({
          user_id: friend_id,
          friend_id: userID,
        })
        await friend_session.save()
      }
      if (friend_session) {
        friend_session.unread += 1
        // const new_message = new message({
        //   session_id: friend_session._id,
        //   send: false,
        //   message: data.message,
        // })
        // await new_message.save()
        // friend_session.lastMessage = new_message
        // await friend_session.save()
        const usersValues = Object.values(users)
        for (const user of usersValues) {
          if (friend_id === user.user_id) {
            return [user.id, friend_session._id]
          }
        }
      }
    }
  }

  io.on('connection', async (socket) => {
    const cookie = socket.request.headers.cookie
    if (!cookie) {
      return needLogin(socket)
    }
    const sessKey = app.context.getCookie(cookie, 'koa:sess')
    if (!sessKey) {
      return needLogin(socket)
    }
    console.log('sesskey ', sessKey)
    const data = await app.context.store.get(sessKey, 86400000, {
      rolling: false,
    })
    if (!data.passport.user) {
      return needLogin(socket)
    }
    // store all users
    const socketID = socket.id
    const user = data.passport.user as IAdmin
    users[socketID] = {
      id: socket.id,
      user_id: user._id,
    }
    const userID = user._id

    console.log('socketio connected 用户信息', {
      _id: user._id,
      nickname: user.nickname,
      username: user.username,
    })

    // 发送消息
    socket.on('send', async (data: IMessage) => {
      const { session_id } = data

      if (session_id) {
        const session = await imsession.findById(session_id)
        console.log('发送消息', data)
        if (session) {
          const friends = await getFriendIds(session.friend_id)
          if (!friends.includes(userID)) {
            socket.error('你不是对方的好友')
            return
          }
          const model = new message({
            session_id,
            send: true,
            message: data.message,
          })
          await model.save()
          session.lastMessage = model
          await session.save()

          socket.emit('receive', {
            type: MessageType.MESSAGE_RECEIVE,
            session_id,
            data: model,
          })

          const { friend_id } = session

          let friend_session = await imsession.findOne({
            user_id: friend_id,
            friend_id: user._id,
          })
          if (!friend_session) {
            friend_session = new imsession({
              user_id: friend_id,
              friend_id: user._id,
            })
            await friend_session.save()
          }
          if (friend_session) {
            friend_session.unread += 1
            const new_message = new message({
              session_id: friend_session._id,
              send: false,
              message: data.message,
            })
            await new_message.save()
            friend_session.lastMessage = new_message
            await friend_session.save()
            const usersValues = Object.values(users)
            for (const user of usersValues) {
              if (friend_id === user.user_id) {
                socket.broadcast.to(user.id).emit('receive', {
                  type: MessageType.MESSAGE_RECEIVE,
                  session_id: friend_session._id,
                  data: new_message,
                })
                break
              }
            }
          }
        }
      }
    })

    socket.on('disconnect', () => {
      if (users[socketID]) {
        delete users[socketID]
      }
    })

    socket.on('fetch', async (query: FetchData) => {
      console.log('socket fetch', query)
      const userID = user._id
      switch (query.type) {
        case MessageType.MESSAGE_LIST: {
          console.log('message list', query)
          const messages = await getMessages(userID, query.session_id)
          socket.emit('receive', {
            type: query.type,
            session_id: query.session_id,
            data: messages,
          })
          break
        }
        case MessageType.FRIEND_LIST: {
          const list = await getFriends(userID)
          socket.emit('receive', {
            type: query.type,
            data: list,
          })
          break
        }
        case MessageType.SESSION_LIST: {
          try {
            const res = await getSessions(userID)
            socket.emit('receive', {
              type: query.type,
              data: res,
            })
          } catch (e) {
            socket.emit('receive', {
              type: query.type,
              error: e.message,
            })
          }
          break
        }
        case MessageType.SESSION_ADD: {
          try {
            const res = await addSession(userID, query.friend_id, 1)
            socket.emit('receive', {
              type: query.type,
              data: res,
            })
          } catch (e) {
            socket.emit('receive', {
              type: query.type,
              error: e.message,
            })
          }
          break
        }
        case MessageType.SESSION_DELETE: {
          const res = await delSession(userID, query.session_id)
          socket.emit('receive', {
            type: query.type,
            session_id: res && res._id,
          })
          break
        }
        case MessageType.VIDEO_OFFER: {
          const res = await findFriendIdBySessionId(
            query.session_id,
            userID,
            socket
          )
          if (res) {
            socket.broadcast.to(res[0]).emit('receive', {
              type: query.type,
              session_id: res[1],
              data: query.data,
            })
          }
          break
        }
        case MessageType.VIDEO_ANSWER: {
          const res = await findFriendIdBySessionId(
            query.session_id,
            userID,
            socket
          )
          if (res) {
            socket.broadcast.to(res[0]).emit('receive', {
              type: query.type,
              session_id: res[1],
              data: query.data,
            })
          }
          break
        }
        case MessageType.VIDEO_ICE_CANDIDATE: {
          const res = await findFriendIdBySessionId(
            query.session_id,
            userID,
            socket
          )
          if (res) {
            socket.broadcast.to(res[0]).emit('receive', {
              type: query.type,
              session_id: res[1],
              data: query.data,
            })
          }
          break
        }
        case MessageType.VIDEO_LEAVE: {
          const res = await findFriendIdBySessionId(
            query.session_id,
            userID,
            socket
          )
          if (res) {
            socket.broadcast.to(res[0]).emit('receive', {
              type: query.type,
              session_id: res[1],
            })
          }
          break
        }
      }
    })
  })
  return server
}

export { initIM }
