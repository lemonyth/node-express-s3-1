// const { S3 } = require("aws-sdk/clients/s3");
// const command = require("aws-sdk");
const { S3 } = require("aws-sdk");

require("dotenv").config();
const { randomUUID } = require("crypto");

exports.s3Uploadv2 = async (files) => {
  const s3 = new S3({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    },
    region: process.env.AWS_REGION,
  });

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `test-demo-1/${randomUUID()}-${files.originalname}`,
    Body: files.buffer,
  };

  const result = await s3.upload(params).promise();
  return result;
};
