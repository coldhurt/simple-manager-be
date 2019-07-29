import * as mongoose from 'mongoose'

interface IProduct {
  productName: string
  count: number
}

const OPERATION_TYPE = {
  0: 'pop products ',
  1: 'push products'
}

export interface ClientLog extends mongoose.Document {
  operatorId: string
  operationType: number
  operateDate: Date
  clientID: string
  products: Array<IProduct>
}

// Declare Schema
const schema = new mongoose.Schema(
  {
    operatorId: { type: String, required: true, trim: true },
    operationType: { type: Number, required: true, trim: true },
    operateDate: { type: Date, required: true, default: false },
    clientID: { type: String, required: true, trim: true },
    products: { type: Array, default: [] }
  },
  { timestamps: true }
)

// Declare Model to mongoose with Schema
mongoose.model<ClientLog>('cliengLog', schema)

// Export Model to be used in Node
export default mongoose.model<ClientLog>('cliengLog')
