export interface IConfig {
  port: number | string
  prettyLog: boolean
  encryptKey: string
  sessionKeys: Array<string>
  mongodbUrl: string
}

const config: IConfig = {
  mongodbUrl: 'mongodb://localhost:27017/myproject',
  port: process.env.NODE_PORT || 4000,
  prettyLog: process.env.NODE_ENV == 'development',
  encryptKey: 'gnkglsaio12',
  sessionKeys: ['14790jfkal']
}

export { config }
