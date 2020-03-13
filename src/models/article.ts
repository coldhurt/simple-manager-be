import * as mongoose from 'mongoose'

export interface IArticle extends mongoose.Document {
  title: string
  content: string
  author: string
}
// Declare Schema
const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true }
  },
  { timestamps: true }
)

// Declare Model to mongoose with Schema
mongoose.model<IArticle>('article', schema)

// Export Model to be used in Node
export default mongoose.model<IArticle>('article')
