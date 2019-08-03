import * as mongoose from 'mongoose'
import * as moment from 'moment-timezone'
// const moment = require('moment-timezone')

interface IProduct {
  productName: string
  type: string
  count: number
  storageFee: number
  processingFee: number
}

export interface IClient extends mongoose.Document {
  clientName: string
  tel: string
  payStatus: boolean
  products: Array<IProduct>
  nextId?: string
  prevId?: string
  _doc?: Object
}
const dateThailand = moment.tz('Asia/Shanghai')
// Declare Schema
const schema = new mongoose.Schema({
  // _id: { type: mongoose.Types.ObjectId },
  clientName: { type: String, required: true, trim: true },
  tel: { type: String, required: true, trim: true },
  payStatus: { type: Boolean, required: true, default: false },
  products: { type: Array, default: [] },
  created_date: { type: Date, default: dateThailand },
  updated_date: { type: Date, default: dateThailand }
})

// Declare Model to mongoose with Schema
mongoose.model<IClient>('client', schema)

// Export Model to be used in Node
export default mongoose.model<IClient>('client')
