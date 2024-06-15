import { NextRequest, NextResponse } from 'next/server';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
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
    await Promise.all(
      files.map(async (file) => {
        console.log('Uploading:', file.name);
        const Body = (await file.arrayBuffer()) as Buffer;
        s3.send(new PutObjectCommand({ Bucket, Key: file.name, Body }));
      }),
    );
  }
  catch (uploadError) {
    console.error('Upload Error:', uploadError);
    return new NextResponse('Upload failed', { status: 500 });
  }
  //enviroment is the base folder name
  //type is unique random string
  const environment = Math.random().toString(36).substring(7); 
  const type = files[0].name?.split('/')[0] || '';
  return NextResponse.json([environment, type]);
}


export async function GET(req: NextRequest) {
  const environment = req.nextUrl.searchParams.get('environment');
  if (!environment) {
    return new NextResponse('Environment parameter is required', { status: 400 });
  }

  try {
    
    const command = new GetObjectCommand({
      Bucket,
      Key: `${environment}/output.json`,
    });
    const response = await s3.send(command);
    if (!response) {
      return new NextResponse('No files found', { status: 404 });
    }
    if (!response.Body) {
      return new NextResponse('No body found', { status: 404 });
    }
    const bodyString = await response.Body.transformToString() || '';
    console.log('response body :D is :', bodyString);
    return new NextResponse(JSON.stringify({ IP: bodyString }), {
      headers: {
        'content-type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error retrieving files:', error);
    return new NextResponse('Failed to retrieve files', { status: 404 });
  }
}
