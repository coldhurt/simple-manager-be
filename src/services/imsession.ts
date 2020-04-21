import { MYRouter } from '../utils'
import model from '../models/imsession'

async function getSession(user_id: string, session_id: string) {
  const session = await model.findById(session_id)
  if (session && session.user_id === user_id) {
    return session
  }
  return null
}

// 获取IM会话列表
async function getSessions(_id: string) {
  const im_sessions = await model.find({
    user_id: _id,
  })
  return im_sessions
}

// 添加IM会话
async function addSession(_id: string, friend_id: string, type: number) {
  const options = {
    user_id: _id,
    friend_id,
    type,
  }
  const isExist = await model.findOne(options)
  if (!isExist) {
    const new_session = new model(options)
    const res = await new_session.save()
    if (res) {
      return new_session
    } else {
      throw new Error('创建会话失败')
    }
  } else {
    throw new Error('会话已存在')
  }
}

// 获取IM会话列表
async function delSession(user_id: string, session_id: string) {
  if (user_id && session_id) {
    const im_session = await model.findById(session_id)
    if (im_session && im_session.user_id === user_id) {
      const res = await im_session.remove()
      return res ? im_session : false
    }
  }
}

async function readSession(ctx: MYRouter) {
  const { session_id = '' } = ctx.request.body
  if (ctx.isAuthenticated() && session_id) {
    const im_session = await model.findById(session_id)
    if (im_session) {
      // const res = await im_session.()
      im_session.unread = 0
      const res = await im_session.save()
      if (res) {
        ctx.success({ data: im_session })
      } else {
        ctx.failed('readSession failed')
      }
    } else {
      ctx.failed('readSession failed, cant find this session')
    }
  } else {
    ctx.failed('readSession failed, need session_id')
  }
}

export { getSession, getSessions, addSession, delSession, readSession }
