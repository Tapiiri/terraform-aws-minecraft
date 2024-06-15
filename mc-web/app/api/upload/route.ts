import { NextRequest, NextResponse } from 'next/server';
import {
  S3Client,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const Bucket = "neosim5-minecraft-connections-output";
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const config = {
  api: {
      bodyParser: false, // Use formidable or another library to handle 'multipart/form-data'
  },
};

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const files = data.getAll("files") as File[];
  if (!files) {
    return new NextResponse('No files found', { status: 400 });
  }
  console.log('Files:', files);
  try {
    const response = await Promise.all(
      files.map(async (file) => {
        console.log('Uploading:', file.name);
        const Body = (await file.arrayBuffer()) as Buffer;
        s3.send(new PutObjectCommand({ Bucket, Key: file.name, Body }));
      }),
    );
  
    return NextResponse.json(response);
  }
  catch (uploadError) {
    console.error('Upload Error:', uploadError);
    return new NextResponse('Upload failed', { status: 500 });
  }
}
