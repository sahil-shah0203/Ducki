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
  isOpen: boolean;
  onClose: () => void;
}

export default function FileUpload({
  onError,
  setSessionId,
  user_id,
  class_id,
  selectedClassName,
  isOpen,
  onClose,
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(event.target.files ?? [])]);
    }
  };

  const uploadFile = async (file: File, group_id: string) => {
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

    const uuid_file_name = uuid();
    const file_extension = file.name.split('.').pop();
    const file_key = `${uuid_file_name}.${file_extension}`;

    const params = {
      Bucket: S3_BUCKET,
      Key: file_key,
      Body: file,
      ContentDisposition: "inline",
      ContentType: file.type,
      Metadata: {
        index: group_id,
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
        session_id: group_id,
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

  const handleFileUpload = async () => {
    if (files.length > 0) {
      setSuccessMessage(null);

      const group_id = uuid();
      const sessionIds = [uuid(), uuid(), uuid()];
      setSessionId(sessionIds[0] ?? '');

      try {
        await addGroup({
          group_id: group_id,
          group_title: sessionTitle || "New Group",
          class_id: class_id,
          user_id: user_id,
          class_name: selectedClassName ?? "",
        });

        for (let i = 0; i < sessionIds.length; i++) {
          await addSession({
            user_id,
            session_id: sessionIds[i] ?? '',
            session_title: `${sessionTitle} - Session ${i + 1}`,
            group_id: group_id,
          });
        }

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

        const url = `/classes/${class_id}/groups/${group_id}/sessions/${sessionIds[0]}?user=${user_id}&className=${selectedClassName}&classID=${class_id}&groupID=${group_id}&sessionID=${sessionIds[0]}`
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
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-lg rounded bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Upload and Start Session</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              &times;
            </button>
          </div>

          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="block w-full rounded border-2 border-[#437557] bg-white px-4 py-2 text-center text-[#437557] hover:bg-[#CCCCCC] cursor-pointer"
          >
            Add File
          </label>

          <div className="mt-4">
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
            <div className="mt-2 text-sm text-black">
              {uploading && <p>Uploading...</p>}
              {processing && <p>Processing...</p>}
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
                className="w-full rounded bg-[#407855] px-4 py-2 text-white hover:bg-[#7C9C87]"
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
    ) : null
  );
}
