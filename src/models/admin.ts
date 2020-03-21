import * as mongoose from 'mongoose'
import { encryptPassword } from '../utils'

export interface IAdmin extends mongoose.Document {
  username: string
  nickname?: string
  avatar?: string
  password?: string
  type?: number // 1 普通 2 管理员
  validPassword?(pwd: string): boolean
  isAdmin?(): boolean
}

// Declare Schema
const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 20
    },
    password: { type: String, required: true, trim: true, maxlength: 100 },
    avatar: { type: String, trim: true, maxlength: 256 },
    nickname: { type: String, required: true, trim: true, maxlength: 20 },
    type: { type: Number, required: true, default: 1 }
  },
  { timestamps: true }
)

schema.methods.isAdmin = function testFunc() {
  //implementation code goes here
  return this && this.type === 2
}

schema.methods.validPassword = function testFunc(pwd: string) {
  //implementation code goes here
  return this && this.password === encryptPassword(pwd)
}

// Declare Model to mongoose with Schema
mongoose.model<IAdmin>('admin', schema)

// Export Model to be used in Node
export default mongoose.model<IAdmin>('admin')
