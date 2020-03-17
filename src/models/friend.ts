import * as mongoose from 'mongoose'
import { IAdmin } from './admin'

export interface IFriend extends mongoose.Document {
  user_id: string
  friends: string[]
  hasFriend?(friend_id: string): boolean
}

// Declare Schema
const schema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, trim: true, unique: true },
    friends: { type: Array, required: true, trim: true }
  },
  { timestamps: true }
)

schema.methods.hasFriend = function(friend_id: string) {
  friend_id = friend_id.trim()
  if (Array.isArray(this.friends) && this.friends.includes(friend_id)) {
    return true
  }
  return false
}

// Declare Model to mongoose with Schema
mongoose.model<IFriend>('friend', schema)

// Export Model to be used in Node
export default mongoose.model<IFriend>('friend')
