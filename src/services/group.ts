import group from '../models/group'
import userGroup from '../models/userGroup'

async function getGroupById(group_id: string) {
  const data = await group.findById(group_id)
  return data
}

async function createGroup(group_name: string, user_id: string) {
  const g = new group({
    group_name,
    creator: user_id,
    admins: [],
  })
}

async function joinGroup(user_id: string, group_id: string) {
  const data = await getGroupById(group_id)
  if (data) {
    let groups = await userGroup.findOne({ user_id })
    if (!groups) {
      groups = new userGroup({ user_id })
    }
    groups.groups = Array.from(new Set([...groups.groups, group_id]))
    await groups.save()
    return groups
  }
}

export { getGroupById, joinGroup }
