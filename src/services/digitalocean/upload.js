import aws from 'aws-sdk'
import multer from 'multer'
import path from 'path'
import {resizeImage} from './resize'
import BlueBird from 'bluebird'
import fs from 'fs'
// import multerS3 from 'multer-s3'
import _ from 'lodash'
import {getUploadsFolderPath} from './utils'

aws.config.update({
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET
})

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(process.env.DO_URL)

const s3 = new aws.S3({
  endpoint: spacesEndpoint
})

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log(req.body)
    callback(null, getUploadsFolderPath({path: req.headers.path}))
  },
  filename: function (req, file, callback) {
    let name = file.originalname.split('.')[0] + '-' + Date.now() + path.extname(file.originalname)
    name = _.replace(name, /\s/g, '_')
    callback(null, name)
  }
})

const localUpload = multer({storage: storage}).array('files', 20)

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.DO_BUCKET_NAME,
//     acl: 'public-read',
//     metadata: function (req, file, cb) {
//       cb(null, Object.assign({}, req.body))
//     },
//     cacheControl: 'max-age=31536000',
//     contentType: function (request, file, cb) {
//       cb(null, file.mimetype)
//     },
//     key: function (request, file, cb) {
//       console.log(file)
//       cb(null, process.env.UPLOAD_PATH + '/' + file.originalname.split('.')[0] + '-' + Date.now() + path.extname(file.originalname))
//     }
//   })
// }).array('upload', 1)

export const uploadMiddleware = (request, response, next) => {
  _localUpload(request, response)
    .then(req => {
      const sizes = JSON.parse(req.body.sizes) || []
      return BlueBird.map(req.files, o => resizeImage(o, sizes, {path: req.headers.path}))
    })
    .then(result => {
      if (process.env.STORAGE_ENGINE === 'local') {
        result = result.map(imageData => {
          imageData.destination.replace('public', '')
          imageData.path.replace('/public', '')
          _.forOwn(imageData.urls, (val, key) => {
            imageData.urls[key] = val.replace('/public', '')
          })
          imageData.uploadPaths = imageData.uploadPaths.map(path => {
            _.forOwn(path, (val, key) => {
              path[key] = val.replace('public', '')
            })
            return path
          })
          return imageData
        })
      }
      request.data = result
      next()
    })
    .catch(err => {
      response.status(err.code || 500).send(err.message || 'Error uploading images')
    })
}

const _localUpload = (request, response) => {
  return new Promise((resolve, reject) => {
    localUpload(request, response, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve(request)
      }
    })
  })
}

export const uploadImagesToDO = (images) => {
  if (process.env.STORAGE_ENGINE === 'local') {
    return Promise.resolve(images);
  } else {
    return BlueBird.map(images, image => {
      return _performUpload(image.uploadPaths, image.mimetype)
    })
  }
}

const _performUpload = (pathList, mimeType) => {
  return BlueBird.map(pathList, pathObj => {
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(pathObj.local), function (err, data) {
        if (err) {
          reject(err)
        } else {
          // Buffer Pattern; how to handle buffers; straw, intake/outtake analogy
          const base64data = Buffer.from(data, 'binary')

          s3.putObject({
            'Bucket': process.env.DO_BUCKET_NAME,
            'Key': pathObj.remote,
            'Body': base64data,
            'ACL': 'public-read',
            'ContentType': mimeType
          }, function (resp) {
            console.log('Successfully uploaded, ', pathObj.local)
            resolve(resp)
          })
        }
      })
    })
  })
}
