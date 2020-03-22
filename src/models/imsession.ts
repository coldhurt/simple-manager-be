import * as mongoose from 'mongoose'
import { IMessage } from './message'

export interface IMSession extends mongoose.Document {
  lastMessage: IMessage
  user_id: string
  friend_id: string
  type: number // 1: 个人  2: 群组
}
// Declare Schema
const schema = new mongoose.Schema(
  {
    lastMessage: { type: Object },
    user_id: { type: String, required: true, trim: true },
    friend_id: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true, default: 1 }
  },
  { timestamps: true }
)

// Declare Model to mongoose with Schema
mongoose.model<IMSession>('imsession', schema)

// Export Model to be used in Node
export default mongoose.model<IMSession>('imsession')
