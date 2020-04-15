import { MYRouter } from '../utils'
import model from '../models/imsession'

// 获取IM会话列表
async function getSessions(ctx: MYRouter) {
  if (ctx.session.user) {
    const { _id } = ctx.session.user
    const im_sessions = await model.find({
      user_id: _id,
    })
    ctx.success({ data: im_sessions })
  } else {
    ctx.failed('getSessions failed, need login')
  }
}

// 添加IM会话
async function addSession(ctx: MYRouter) {
  const { friend_id = '', type = 1 } = ctx.request.body
  if (ctx.session.user && friend_id) {
    const { _id } = ctx.session.user
    if (friend_id === _id) {
      ctx.failed('addSession failed, you cant add yourself to session')
      return
    }
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
        ctx.success({ data: new_session })
      } else {
        ctx.failed('addSession failed')
      }
    } else {
      ctx.failed('addSession failed, session exists')
    }
  } else {
    ctx.failed('addSession failed, need friend_id')
  }
}

// 获取IM会话列表
async function delSession(ctx: MYRouter) {
  const { session_id = '' } = ctx.request.body
  if (ctx.session.user && session_id) {
    const { _id } = ctx.session.user
    const im_session = await model.findById(session_id)
    if (im_session) {
      const res = await im_session.remove()
      if (res) {
        ctx.success({ data: im_session })
      } else {
        ctx.failed('delSession failed')
      }
    } else {
      ctx.failed('delSession failed, cant find this session')
    }
  } else {
    ctx.failed('delSession failed, need friend_id')
  }
}

async function readSession(ctx: MYRouter) {
  const { session_id = '' } = ctx.request.body
  if (ctx.session.user && session_id) {
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

export { getSessions, addSession, delSession, readSession }
