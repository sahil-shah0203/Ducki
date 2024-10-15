import React, { useState } from "react";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import uuid from "react-uuid";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

interface FileUploadProps {
  onError: (error: string | null) => void;
  setSessionId: (sessionId: string) => void;
  user_id: number;
  class_id: number;
  selectedClassName: string | null;
}

export default function FileUpload({
  onError,
  setSessionId,
  user_id,
  class_id,
  selectedClassName,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>("");

  const { mutateAsync: addGroup } = api.group.addGroup.useMutation();
  const { mutateAsync: addSession } = api.session.addSession.useMutation();
  const { mutateAsync: addDocument } = api.documents.addDocument.useMutation();

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  const router = useRouter();

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(event.target.files ?? [])]);
    }
  };

  // Upload file to S3
  const uploadFile = async (file: File, class_id: string) => {
    setUploading(true);
    const S3_BUCKET = "ducki-documents";
    const REGION = "us-east-1";

    const s3Client = new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
      },
    });

    const uuid_file_name = uuid(); // Generate UUID
    const file_extension = file.name.split('.').pop();
    const file_key = `${uuid_file_name}.${file_extension}`;

    const params = {
      Bucket: S3_BUCKET,
      Key: file_key,
      Body: file,
      ContentDisposition: "inline",
      ContentType: file.type,
      Metadata: {
        class_id: class_id,
      },
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
      setUploading(false);
      return { uuid_file_name, original_file_name: file.name, file_key };
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

  // Invoke Lambda function to process the file
  const processFile = async (file_key: string, group_id: string) => {
    setProcessing(true);
    const LAMBDA_FUNCTION = "process_document";
    const REGION = "us-east-1";

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
        document_name: file_key,
        class_id: class_id,
        group_id: group_id,
      }),
    };

    try {
      await lambdaClient.send(new InvokeCommand(params));
      setProcessing(false);
      setSuccessMessage("File processed successfully.");
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

  // Handle file upload and session/group creation
  const handleFileUpload = async () => {
    if (files.length > 0) {
      setSuccessMessage(null);

      const group_id = uuid();
      const sessionIds = [uuid(), uuid(), uuid()];
      setSessionId(sessionIds[0] ?? '');

      try {
        // Create the group
        await addGroup({
          group_id: group_id,
          group_title: sessionTitle || "New Group",
          class_id: class_id,
        });

        // Create the sessions
        for (let i = 0; i < sessionIds.length; i++) {
          await addSession({
            user_id,
            session_id: sessionIds[i] ?? '',
            session_title: `${sessionTitle} - Session ${i + 1}`,
            group_id: group_id,
          });
        }

        // Upload and process files
        for (const file of files) {
          if (!allowedTypes.includes(file.type)) {
            onError("Invalid file type");
            return;
          }

          const result = await uploadFile(file, group_id);
          if (result != null) {
            const { uuid_file_name, original_file_name, file_key } = result;
            await processFile(file_key, group_id);

            const S3_BUCKET = "ducki-documents";
            const REGION = "us-east-1";
            const documentUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${file_key}`;
            await addDocument({
              document_id: uuid_file_name,
              url: documentUrl,
              name: original_file_name,
              userId: user_id,
              classId: class_id,
              group_id: group_id,
            });
          } else {
            onError("Failed to upload file");
          }
        }

        // Redirect to the first session
        const url = `/classes/${class_id}/sessions/${sessionIds[0]}?user=${user_id}&className=${selectedClassName}&classID=${class_id}&sessionID=${sessionIds[0]}`;
        router.push(url);
      } catch (error) {
        console.error("Failed to start session", error);
        onError("Failed to start session");
      }
    } else {
      onError("Select a file to begin.");
    }
  };

  return (
    <div className="flex w-full items-center justify-center rounded bg-gray-200 p-4 shadow-md">
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
            className="mr-4 mt-4 rounded border-2 border-[#437557] bg-white px-4 py-2 text-[#437557] hover:bg-[#CCCCCC]"
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
          <div className="mr-2 flex-grow rounded border px-2 py-1 text-sm text-black">
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
              className="mb-4 w-full rounded border px-3 py-2"
            />
            <button
              onClick={handleFileUpload}
              className="rounded bg-[#407855] px-4 py-2 text-white hover:bg-[#7C9C87]"
            >
              Start Session
            </button>
          </>
        )}
        {successMessage && (
          <p className="mt-4 text-green-500">{successMessage}</p>
        )}
      </div>
    </div>
  );
}