import React, { useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import uuid from 'react-uuid';
import { api } from '~/trpc/react';
import {useRouter} from 'next/navigation';

interface FileUploadProps {
  onError: (error: string | null) => void;
  setSessionId: (sessionId: string) => void;
  user_id: number;
  class_id: number;
  selectedClassName: string | null;
}

export default function FileUpload({  onError, setSessionId, user_id, class_id, selectedClassName }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const { mutateAsync: addSession } = api.session.addSession.useMutation();

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const uploadFile = async (file: File, session_id: string) => {
    setUploading(true);
    const S3_BUCKET = 'ducki-documents';
    const REGION = 'us-east-1';

    const s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
      },
    });

    const file_name = uuid();

    const params = {
      Bucket: S3_BUCKET,
      Key: `${file_name}.pdf`,
      Body: file,
      Metadata: {
        index: session_id,
      },
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
      setUploading(false);
      return file_name;
    } catch (error) {
      console.error(error);
      setUploading(false);

      if (error instanceof Error) {
        onError('Error uploading file: ' + error.message);
      } else {
        onError('Error uploading file: An unknown error occurred');
      }

      return null;
    }
  };

  const processFile = async (file_name: string, session_id: string) => {
    setProcessing(true);
    const LAMBDA_FUNCTION = 'process_document';
    const REGION = 'us-east-1';

    const lambdaClient = new LambdaClient({
      region: REGION,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
      },
    });

    const params = {
      FunctionName: LAMBDA_FUNCTION,
      Payload: JSON.stringify({
        document_name: file_name,
        class_id: class_id,
        session_id: session_id,
      }),
    };

    try {
      await lambdaClient.send(new InvokeCommand(params));
      setProcessing(false);
      setSuccessMessage('File processed successfully.');
      setSessionId(session_id);
    } catch (error) {
      console.error(error);
      setProcessing(false);

      if (error instanceof Error) {
        onError('Error processing file: ' + error.message);
      } else {
        onError('Error processing file: An unknown error occurred');
      }
    }
  };

  const handleFileUpload = async () => {
    if (files.length > 0) {
      setSuccessMessage(null);

      const session_id = uuid();
      setSessionId(session_id);
      console.log('Session ID:', session_id);

      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          onError('Invalid file type');
          return;
        }
        const file_name = await uploadFile(file, session_id);
        if (file_name != null) {
          await processFile(file_name, session_id);
          try {
            const newSession = await addSession({
              user_id,
              class_id: class_id,
              session_id: session_id,
              session_title: sessionTitle,
            });
          } catch (error) {
            console.error('Failed to start session', error);
          }
        } else {
          onError('Failed to upload file');
        }
      }

      const url = `/classes/${class_id}/sessions/${session_id}?user=${user_id}&className=${selectedClassName}&classID=${class_id}&sessionID=${session_id}`;
      router.push(url)
    } else {
      onError('Select a file to begin.');
    }

    
  };

  return (
    <div className="bg-gray-200 p-4 rounded shadow-md w-full flex justify-center items-center">
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="mt-4 mr-4 rounded border-2 border-[#437557] bg-white px-4 py-2 text-[#437557] hover:bg-[#cccccc]"
          >
            Add File
          </label>
        </div>
        <div>
          {files.length > 0 ? (
            <ul className="mb-4">
              {files.map((file, index) => (
                <li key={index} className="text-gray-700">
                  {file.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">Select a file to begin.</p>
          )}
        </div>
        {uploading || processing ? (
          <div className="border rounded py-1 px-2 flex-grow text-black text-sm mr-2">
            {uploading && <p>Uploading</p>}
            {processing && <p>Processing</p>}
          </div>
        ) : (
          <>
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder="Enter session title"
              className="border rounded py-2 px-3 mb-4 w-full"
            />
            <button
              onClick={handleFileUpload}
              className="rounded bg-[#407855] px-4 py-2 text-white hover:bg-[#7c9c87]"
            >
              Start Session
            </button>
          </>
        )}
        {successMessage && (
          <p className="text-green-500 mt-4">{successMessage}</p>
        )}
      </div>
    </div>
  );
}