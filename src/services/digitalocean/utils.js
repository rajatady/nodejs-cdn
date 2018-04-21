import moment from 'moment'
import mkdirp from 'mkdirp'
import path from 'path'

export const getUploadsFolderPath = () => {
  let p = process.env.UPLOAD_PATH + '/' + moment().format('DD-MMM-YY').toString() + '/'
  mkdirp.sync(path.resolve(p))
  return p
}
