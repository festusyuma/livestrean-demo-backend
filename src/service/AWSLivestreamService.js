import AWS from 'aws-sdk'

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: 'v4'
})

const ivs = new AWS.IVS()
