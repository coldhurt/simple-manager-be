import * as mongoose from 'mongoose'

export interface IMessage extends mongoose.Document {
  message: string
  session_id: string
  // 1：发送 2：接受
  send: boolean
  // type: number // 1: 个人  2: 群组
}
// Declare Schema
const schema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    session_id: { type: String, required: true, trim: true },
    send: { type: Boolean, required: true, trim: true }
    // receiver: { type: String, required: true, trim: true },
    // type: { type: String, required: true, trim: true, default: 1 }
  },
  { timestamps: true }
)

// Declare Model to mongoose with Schema
mongoose.model<IMessage>('message', schema)

// Export Model to be used in Node
export default mongoose.model<IMessage>('message')
