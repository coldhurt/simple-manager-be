import Client, { IClient } from '../models/client'
import { MYRouter } from '../utils'

interface IAppendData {
  prevId?: string
  nextId?: string
}

async function findClient(ctx: MYRouter) {
  const body = ctx.request.body
  console.log('findById: ' + body.id)
  const client: IClient = await Client.findById(body.id)
  const nextClient = await Client.findOne({ _id: { $gt: body.id } })
    .sort({ _id: 1 })
    .limit(1)
  const prevClient = await Client.findOne({ _id: { $lt: body.id } })
    .sort({ _id: -1 })
    .limit(1)
  const appendData: IAppendData = {}
  if (prevClient) {
    appendData.prevId = prevClient._id
  }
  if (nextClient) {
    appendData.nextId = nextClient._id
  }
  ctx.success({ data: { ...client._doc, ...appendData } })
}

async function findAll(ctx: MYRouter) {
  // Fetch all Client’s from the database and return as payload
  const clients = await Client.find({}, [
    '_id',
    'clientName',
    'tel',
    'payStatus',
    'createdAt'
  ])
  ctx.success({ data: clients })
}

async function create(ctx: MYRouter) {
  const body: IClient = ctx.request.body
  const res = await Client.find({ clientName: body.clientName })
  if (res && res.length > 0) {
    ctx.failed({ msg: 'exist same client' })
  } else {
    const newClient = new Client(body)
    const savedClient = await newClient.save()
    ctx.success({ data: savedClient })
  }
}

async function destroy(ctx: MYRouter) {
  // Get id from request body and find Client in database
  const id = ctx.request.body.id
  const client = await Client.findById(id)

  // Delete client from database and return deleted object as reference
  if (client) {
    const deletedClient = await client.remove()
    ctx.success({ data: deletedClient })
  } else {
    ctx.failed({
      msg: 'client not found'
    })
  }
}

async function update(ctx: MYRouter) {
  // Find Client based on id, then update it
  const id = ctx.request.body.id
  const client = await Client.findById(id)
  const body: IClient = ctx.request.body
  Object.assign(client, body)

  // Update client in database
  const updatedClient = await client.save()
  ctx.success({ data: updatedClient })
}

const clientCtrl = {
  findClient,
  findAll,
  create,
  destroy,
  update
}

export default clientCtrl
