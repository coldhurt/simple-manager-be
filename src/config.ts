export interface IConfig {
  port: number | string
  prettyLog: boolean
  encryptKey: string
  sessionKeys: Array<string>
  mongodbUrl: string
  redis: Object
}

const config: IConfig = {
  mongodbUrl: 'mongodb://localhost:27017/myproject',
  port: process.env.NODE_PORT || 4000,
  prettyLog: process.env.NODE_ENV == 'development',
  encryptKey: 'gnkglsaio12',
  sessionKeys: ['14790jfkal'],
  redis: {
    host: '192.168.99.100',
    port: 6379
  }
}

export { config }
