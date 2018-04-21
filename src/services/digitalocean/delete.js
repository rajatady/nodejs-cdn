import BlueBird from 'bluebird'
import path from 'path'
import fs from 'fs'
import aws from 'aws-sdk'
import {getAllImages} from './get'

aws.config.update({
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET
})

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(process.env.DO_URL)

const s3 = new aws.S3({
  endpoint: spacesEndpoint
})

export const removeImages = (images) => {
  return BlueBird.map(images, o => {
    return _performDeletion(o.uploadPaths)
  })
}

const _performDeletion = (paths) => {
  return BlueBird.map(paths, o => {
    return new Promise((resolve, reject) => {
      fs.unlink(path.resolve(o.local), (err, res) => {
        if (err) {
          reject(err)
        } else {
          console.log('Removed local file : ', o.local)
          resolve()
        }
      })
    })
  })
}

export const removeSingleFile = (deleteParams) => {
  return new Promise((resolve, reject) => {
    s3.deleteObject(deleteParams, function (err, data) {
      if (err) {
        console.log('delete err ' + deleteParams.Key)
        reject(err)
      } else {
        console.log('deleted ' + deleteParams.Key)
        resolve(data)
      }
    })
  })
}

export const removeAllImages = () => {
  return new Promise((resolve, reject) => {
    getAllImages()
      .then(data => {
        const items = data.Contents
        return BlueBird.map(items, o => {
          console.log(o)
          const deleteParams = {Bucket: process.env.DO_BUCKET_NAME, Key: o.Key}
          return removeSingleFile(deleteParams)
        })
      })
      .then(result => resolve(result))
      .catch(err => reject(err))
  })
}
