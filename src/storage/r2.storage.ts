import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand  } from '@aws-sdk/client-s3';
import { s3Client } from '../lib/r2.config.js';

export async function saveFile(buffer: any, filename: any, mimetype: any) {
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: mimetype,
  }));
}

export const deleteFile = async (fileName: string) => {
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: fileName,
        })
    );
}

export function getUrl(filename: any) {
  return `${process.env.R2_PUBLIC_URL}/${filename}`;
}