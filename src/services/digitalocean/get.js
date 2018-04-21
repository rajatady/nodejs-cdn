import aws from 'aws-sdk'

aws.config.update({
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET
})

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(process.env.DO_URL)

const s3 = new aws.S3({
  endpoint: spacesEndpoint
})

export const getAllImages = (query) => {
  return new Promise((resolve, reject) => {
    const s3Query = {Bucket: process.env.DO_BUCKET_NAME}
    console.log(query)
    if (query.listFolders) {
      s3Query.Delimiter = '/'
    }
    s3.listObjects(s3Query, function (err, data) {
      if (err) {
        console.log('error listing bucket objects ' + err)
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
