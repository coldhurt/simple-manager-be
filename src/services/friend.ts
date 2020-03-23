import friend from '../models/friend'
import { MYRouter } from '../utils'
import admin, { IAdmin } from '../models/admin'

async function getFriends(ctx: MYRouter) {
  if (ctx.session.user) {
    const { _id } = ctx.session.user
    let res = await friend.findOne({ user_id: _id })
    let friends: IAdmin[] = []
    if (!res) {
      const model = new friend({ user_id: _id, friends: [] })
      await model.save()
    } else {
      friends = await admin.find(
        { _id: { $in: res.friends } },
        { _id: true, nickname: true, username: true, avatar: true }
      )
    }
    ctx.success({ data: friends })
  } else {
    ctx.failed('get friends failed, need user_id')
  }
}

async function addFriends(ctx: MYRouter) {
  let { friend_id } = ctx.request.body
  if (ctx.session.user && friend_id) {
    friend_id = friend_id.trim()
    const { _id } = ctx.session.user
    if (_id === friend_id) {
      ctx.failed('you cant add yourself as a friend')
      return
    }
    const res = await friend.findOne({ user_id: _id })
    if (res.hasFriend(friend_id)) {
      ctx.failed('already added')
    } else {
      const userFriend = await admin.findById(friend_id)
      if (userFriend) {
        await res.update({
          friends: res.friends.concat(friend_id)
        })
        const targetFriend = await friend.findOne({ user_id: friend_id })
        if (targetFriend && !targetFriend.hasFriend(_id)) {
          await targetFriend.update({
            friends: res.friends.concat(_id)
          })
        }
      }

      ctx.success({ data: [userFriend] })
    }
  } else {
    ctx.failed('add friend failed, need user_id')
  }
}

async function delFriends(ctx: MYRouter) {
  const { friend_id } = ctx.request.body
  if (ctx.session.user && friend_id) {
    const { _id } = ctx.session.user
    const res = await friend.findOne({ user_id: _id })
    if (res.hasFriend(friend_id)) {
      await res.update({
        friends: res.friends.filter(id => id != friend_id)
      })
    }
    ctx.success({ msg: 'delete successfully' })
  } else {
    ctx.failed('getFriends failed, need user_id')
  }
}

export { getFriends, addFriends, delFriends }
