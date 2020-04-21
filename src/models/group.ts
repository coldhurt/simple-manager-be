import * as mongoose from 'mongoose'
import counter from './counter'

export interface IGroup extends mongoose.Document {
  creator: string
  group_name: string
  admins: string[]
  group_no: string
}
// Declare Schema
const schema = new mongoose.Schema<IGroup>(
  {
    creator: { type: String, required: true },
    group_name: { type: String, required: true, trim: true, maxlength: 40 },
    admins: { type: Array, default: [] },
    group_no: { type: String, required: true },
  },
  { timestamps: true }
)

schema.pre('save', function (next) {
  const doc = this as IGroup
  counter.findByIdAndUpdate(
    { _id: 'entityId' },
    { $inc: { group_no: 1 } },
    function (error, counter) {
      if (error) return next(error)
      doc.group_no = counter.group_no.toString()
      next()
    }
  )
})

// Declare Model to mongoose with Schema
mongoose.model<IGroup>('group', schema)

// Export Model to be used in Node
export default mongoose.model<IGroup>('group')
