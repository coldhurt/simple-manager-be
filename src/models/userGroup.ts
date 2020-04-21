import * as mongoose from 'mongoose'

export interface IUserGroup extends mongoose.Document {
  user_id: string
  groups: string[]
  hasGroup?(group_id: string): boolean
}

// Declare Schema
const schema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, trim: true, unique: true },
    groups: { type: Array, required: true, trim: true },
  },
  { timestamps: true }
)

schema.methods.hasFriend = function (group_id: string) {
  group_id = group_id.trim()
  if (Array.isArray(this.groups) && this.groups.includes(group_id)) {
    return true
  }
  return false
}

// Declare Model to mongoose with Schema
mongoose.model<IUserGroup>('userGroup', schema)

// Export Model to be used in Node
export default mongoose.model<IUserGroup>('userGroup')
