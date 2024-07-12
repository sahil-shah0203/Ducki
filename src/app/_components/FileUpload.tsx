import React, { useState } from 'react';
import AWS from 'aws-sdk';
import uuid from 'react-uuid';
import { superballs } from 'ldrs'
import { leapfrog } from 'ldrs'

leapfrog.register()
superballs.register();

interface FileUploadProps {
  onUploadSuccess: () => void;
  onError: (error: string | null) => void;
}

export default function FileUpload({ onUploadSuccess, onError }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const S3_BUCKET = 'ducki-documents';
    const REGION = 'us-east-1';

    const s3 = new AWS.S3({
      region: REGION,
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });

    const file_name = uuid();

    const params = {
      Bucket: S3_BUCKET,
      Key: file_name + ".pdf",
      Body: file,
      Metadata: {
        index: "test_index1",
      },
    };

    try {
      const upload = await s3.putObject(params).promise();
      console.log(upload);
      setUploading(false);
      return file_name;
    } catch (error) {
      console.error(error);
      setUploading(false);

      if (error instanceof Error) {
        onError("Error uploading file: " + error.message);
      } else {
        onError("Error uploading file: An unknown error occurred");
      }

      return null;
    }
  };

  const processFile = async (file_name: string) => {
    setProcessing(true);
    const LAMBDA_FUNCTION = "process_document";
    const REGION = "us-east-1";

    const lambda = new AWS.Lambda({
      region: REGION,
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      FunctionName: LAMBDA_FUNCTION,
      Payload: JSON.stringify({
        document_name: file_name,
        index: "test_index1"
      }),
    };

    try {
      const response = await lambda.invoke(params).promise();
      console.log(response);
      setProcessing(false);
      setSuccessMessage("File processed successfully.");
      onUploadSuccess();
    } catch (error) {
      console.error(error);
      setProcessing(false);

      if (error instanceof Error) {
        onError("Error processing file: " + error.message);
      } else {
        onError("Error processing file: An unknown error occurred");
      }
    }
  };

  const handleFileUpload = async () => {
    if (files.length > 0) {
      setSuccessMessage(null);
      for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
          onError("Invalid file type");
          return;
        }
        const file_name = await uploadFile(file);
        if (file_name != null) {
          await processFile(file_name);
        } else {
          onError("Failed to upload file");
        }
      }
    } else {
      onError("No files selected.");
    }
  };

  return (
    <div className="bg-gray-200 p-4 rounded shadow-md w-full">
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
          className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
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
          <p className="text-gray-700">No files selected.</p>
        )}
      </div>
      {(uploading || processing) ? (
        <div className="border rounded py-1 px-2 flex-grow text-black text-sm mr-2">
          {uploading && <p>Uploading</p>}
          {uploading &&
          <l-superballs
            size="30"
            speed="1.3" 
            color="green" 
            ></l-superballs>}
          {processing && <p>Processing</p>}
          {processing &&
          <l-leapfrog
            size="30"
            speed="2.5" 
            color="green" 
            ></l-leapfrog>}
        </div>
      ) : (
        <button
          onClick={handleFileUpload}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Start Session
        </button>
      )}
      {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
    </div>
  );
}
