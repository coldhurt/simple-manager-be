import * as Router from 'koa-router'
import { needAuth } from '../utils'
import * as fs from 'fs'
import * as path from 'path'

const router = new Router()

const BASE_API_DIR = path.resolve(__dirname, '../api')

const files = fs.readdirSync(BASE_API_DIR)

const methods = ['post', 'get']

function dealWithDir(files: string[], parentPath = BASE_API_DIR) {
  let paths: object[] = []
  for (const file of files) {
    const abs = path.resolve(parentPath, file)
    const stats = fs.lstatSync(abs)
    if (stats.isDirectory()) {
      const subFiles = fs.readdirSync(abs)
      paths = paths.concat(dealWithDir(subFiles, abs))
    } else {
      const obj = require(abs)
      let routePath = abs.replace(/\\/g, '/').replace('.ts', '')
      routePath = routePath.substr(routePath.indexOf('/api'))
      obj.path = routePath
      for (const method of methods) {
        if (obj[method]) {
          if (obj.needAuth) {
            ;(router as { [key: string]: any })[method](
              routePath,
              needAuth(obj[method])
            )
          } else {
            ;(router as { [key: string]: any })[method](routePath, obj[method])
          }
        }
      }
      paths.push(obj)
    }
  }
  return paths
}

console.log('routes list\n', dealWithDir(files))

export const routes = router.routes()
