import { addSession } from '../../services/imsession'
import { MYRouter } from '../../utils'

export const post = async (ctx: MYRouter) => {
  const { friend_id = '', type = 1 } = ctx.request.body
  if (ctx.session.passport.user && friend_id) {
    const { _id } = ctx.session.passport.user
    if (friend_id === _id) {
      ctx.failed('你不能添加你自己做会话')
      return
    }
    try {
      const res = await addSession(_id, friend_id, type)
      ctx.success({ data: res })
    } catch (e) {
      ctx.failed(e.message || '服务器错误')
    }
  } else {
    ctx.failed('创建失败，需要friend_id')
  }
}

export const needAuth = true
