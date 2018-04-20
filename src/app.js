import http from 'http'
import { env, mongo, port, ip, apiRoot } from './config'
import mongoose from './services/mongoose'
import express from './services/express'
import api from './api'
import mkdirp from 'mkdirp'
import path from 'path'

const app = express(apiRoot, api)
const server = http.createServer(app)

mongoose.connect(mongo.uri, { useMongoClient: true })
mongoose.Promise = Promise

mkdirp.sync(path.resolve(process.env.LOCAL_TEMP_FOLDER))

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

export default app
