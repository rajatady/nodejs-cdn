import sharp from 'sharp'
import async from 'async'
import rgbHex from 'rgb-hex'
import getImageData from 'get-image-data'
import dominant from 'huey/dominant'
import _ from 'lodash'
import {getUploadsFolderPath} from './utils'

const getPathName = (path, skips) => {
  const a = path.split('/')
  for (let i = 0; i < skips; i++) {
    a.shift()
  }
  return '/' + a.join('/')
}

export const resizeImage = function (image, sizes) {
  // image.fileName = image.fileName.replace(/\s+/g, '');
  const fileName = image.filename.split('.')[0]
  const extension = '.' + image.filename.split('.').splice(-1)
  const localUploadPath = getUploadsFolderPath()
  const fullPath = localUploadPath + fileName + extension
  const imageDaTa = sharp(fullPath)
  image.extension = extension
  image.path = getPathName(image.path, 0)
  image.urls = {
    full: getPathName(fullPath, 0)
  }
  image.uploadPaths = []
  image.data = {}
  return new Promise(function (resolve, reject) {
    if (extension === '.svg') {
      const curPath = localUploadPath + fileName + extension
      image.urls['full'] = getPathName(curPath, 0)
      image.urls['thumbnail'] = getPathName(curPath, 0)
      image.urls['medium'] = getPathName(curPath, 0)
      image.urls['large'] = getPathName(curPath, 0)
      resolve(image)
    } else {
      async.each(sizes, function (size, callback) {
        const curPath = localUploadPath + fileName + '-' + size.attributeName + extension
        const stagePath = localUploadPath + fileName + '-' + size.attributeName + '-staged' + extension

        const a = imageDaTa.resize(size.width, size.height)
        getOutputFormat(extension, 70, a)
          .toFile(curPath)
          .then((data) => {
            image.urls[size.attributeName] = getPathName(curPath, 0)
            image.data[size.attributeName] = data
            if (extension === '.svg') {
              return imageDaTa
            } else {
              const b = imageDaTa
                .resize(Math.floor(size.width / 2), Math.floor(size.height / 2))
              return getOutputFormat(extension, 20, b)
                .blur(4.0)
                .toFile(stagePath)
            }
          })
          .then((data) => {
            image.urls[size.attributeName + 'Staged'] = getPathName(stagePath, 0)
            image.data[size.attributeName + 'Staged'] = data
            callback()
          })
          .catch(function (err) {
            console.log(err)
            callback(err)
          })
      }, function (err) {
        // if any of the file processing produced an error, err would equal that error
        if (err) {
          // One of the iterations produced an error.
          // All processing will now stop.
          console.log('A file failed to process', err)
          reject(err)
        } else {
          const curPath = localUploadPath + fileName + extension
          getImageData(curPath, (error, img) => {
            if (error) {
              reject(error)
            } else {
              image.urls['full'] = getPathName(curPath, 0)
              const rgb = dominant(img.data)
              const hex = rgbHex(rgb[0], rgb[1], rgb[2])
              image.swatch = {
                css: '#' + hex,
                r: rgb[0],
                g: rgb[1],
                b: rgb[2]
              }
              _.forOwn(image.urls, (url, key) => {
                image.uploadPaths.push({
                  remote: url.replace('/', ''),
                  local: url.replace('/', '')
                })
              })
              resolve(image)
            }
          })
        }
      })
    }
  })
}

const getOutputFormat = (extension, quality, sharpObject) => {
  switch (extension) {
    case '.png' :
      return sharpObject.png({quality: quality})

    case '.jpg' :
      return sharpObject.jpeg({quality: quality})

    case '.jpeg' :
      return sharpObject.jpeg({quality: quality})

    default :
      return sharpObject.webp({quality: quality, nearLossless: true})
  }
}
