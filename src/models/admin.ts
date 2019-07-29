import * as mongoose from 'mongoose'

export interface IAdmin extends mongoose.Document {
  username: string
  password: string
}

// Declare Schema
const schema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true }
  },
  { timestamps: true }
)

// Declare Model to mongoose with Schema
mongoose.model<IAdmin>('admin', schema)

// Export Model to be used in Node
export default mongoose.model<IAdmin>('admin')
