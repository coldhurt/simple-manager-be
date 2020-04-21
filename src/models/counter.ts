import * as mongoose from 'mongoose'

export interface ICounter extends mongoose.Document {
  group_no: Number
  user_no: Number
}

const CounterSchema = new mongoose.Schema<ICounter>({
  _id: { type: String, required: true },
  group_no: { type: Number, default: 100000 },
  user_no: { type: Number, default: 100000 },
})

// Declare Model to mongoose with Schema
mongoose.model<ICounter>('counter', CounterSchema)

// Export Model to be used in Node
export default mongoose.model<ICounter>('counter')
