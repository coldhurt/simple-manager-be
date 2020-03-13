import Article, { IArticle } from '../models/article'
import { MYRouter, needAuth } from '../utils'

async function list(ctx: MYRouter) {
  const articles = await Article.find(
    {},
    { title: true, author: true, createdAt: true, _id: true }
  )
  ctx.success({
    data: articles
  })
}

async function detail(ctx: MYRouter) {
  const { id } = ctx.request.body
  if (id) {
    console.log('findById: ' + id)
    const article = await Article.findById(id)
    if (article)
      ctx.success({
        data: article
      })
    else ctx.failed('not exists this article')
  } else {
    ctx.failed('need id')
  }
}

async function create(ctx: MYRouter) {
  const { title, content } = ctx.request.body
  if (title && content) {
    const newArticle = new Article({ title, content, author: ctx.session.id })
    const saveRes = await newArticle.save()
    ctx.success({ data: saveRes })
  } else {
    ctx.failed('need title and content')
  }
}

async function destroy(ctx: MYRouter) {
  const { id } = ctx.request.body
  if (id) {
    const article = await Article.findById(id)
    if (article) {
      const deleteRes = await article.remove()
      ctx.success({ data: deleteRes })
    } else {
      ctx.failed('not found this article')
    }
  } else {
    ctx.failed('need article id')
  }
}

async function update(ctx: MYRouter) {
  const { id, title, content } = ctx.request.body
  if (id) {
    const article = await Article.findById(id)
    if (article) {
      const updateRes = await article.update({
        title: title || article.title,
        content: content || article.content
      })
      ctx.success({ data: updateRes })
    } else {
      ctx.failed('not found this article')
    }
  } else {
    ctx.failed('need article id')
  }
}

export { list, detail, create, destroy, update }
