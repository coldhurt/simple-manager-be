import * as mongoose from 'mongoose'
import { encryptPassword } from '../utils'

export interface IAdmin extends mongoose.Document {
  username: string
  password: string
  validPassword(pwd: string): boolean
}

// Declare Schema
const schema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true }
  },
  { timestamps: true }
)

schema.methods.validPassword = function testFunc(pwd: string) {
  //implementation code goes here
  return this && this.password === encryptPassword(pwd)
}

// Declare Model to mongoose with Schema
mongoose.model<IAdmin>('admin', schema)

// Export Model to be used in Node
export default mongoose.model<IAdmin>('admin')
