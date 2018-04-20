import BlueBird from 'bluebird'
import path from 'path'
import fs from 'fs'

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
