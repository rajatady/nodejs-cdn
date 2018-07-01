import moment from 'moment'
import mkdirp from 'mkdirp'
import nodePath from 'path'

export const getUploadsFolderPath = (options) => {
  let p, path
  if (options && options.path) {
    path = options.path
    if (path.indexOf('/') === 0) {
      path = path.replace('/', '')
    }
    if (path.indexOf('/') === path.length - 1) {
      path = path.slice(0, -1)
    }
  } else {
    path = moment().format('DD-MMM-YY').toString()
  }
  if (process.env.STORAGE_ENGINE === 'local') {
    p = 'public/' + process.env.UPLOAD_PATH + '/' + path + '/'
  } else {
    p = process.env.UPLOAD_PATH + '/' + path + '/'
  }
  mkdirp.sync(nodePath.resolve(p))
  return p
}
