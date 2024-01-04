// const { S3 } = require("aws-sdk/clients/s3");
// const command = require("aws-sdk");
// const { S3 } = require("aws-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

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

  //uploading single file
  //   const params = {
  //     Bucket: process.env.AWS_BUCKET_NAME,
  //     Key: `test-demo-1/${randomUUID()}-${files.originalname}`,
  //     Body: files.buffer,
  //   };

  //    const result = await s3.upload(params).promise();
  //    return result;

  // uploading multiple files at once

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `test-demo-1/${randomUUID()}-${file.originalname}`,
      Body: file.buffer,
    };
  });

  const results = await Promise.all(
    params.map((param) => s3.upload(param).promise())
  );

  return results;
};

//USING V3 OF THE Sdk

// exports.s3Uploadv3 = async (files) => {
//   const s3client = new S3Client({
//     credentials: {
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
//     },
//     region: process.env.AWS_REGION,
//   });

//   //   const param = {
//   //     Bucket: process.env.AWS_BUCKET_NAME,
//   //     Key: `test-demo-1/${randomUUID()}-${file.originalname}`,
//   //     Body: file.buffer,
//   //   };

//   //   return s3client.send(new PutObjectCommand(param));

//   const params = files.map((file) => {
//     return {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `test-demo-1/${randomUUID()}-${file.originalname}`,
//       Body: file.buffer,
//     };
//   });

//   const results = await Promise.all(
//     params.map((param) => s3client.send(new PutObjectCommand(param)))
//   );

//   return results;
// };

exports.s3Uploadv3 = async (files) => {
  return await Promise.all(
    files.map((file) => {
      const client = new Upload({
        client: new S3Client({
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
          },
          //   region: process.env.AWS_REGION,
        }),
        params: {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `test-demo-1/${randomUUID()}-${file.originalname}`,
          Body: file.buffer,
        },
      });
      return client.done();
    })
  );
};
