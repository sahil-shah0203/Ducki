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
      setFiles(Array.from(event.target.files));
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
    const file_extension = file.name.split(".").pop();
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
      setUploading(false);
      onError("Error uploading file: " + (error instanceof Error ? error.message : "An unknown error occurred"));
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
      setProcessing(false);
      onError("Error processing file: " + (error instanceof Error ? error.message : "An unknown error occurred"));
    }
  };

  const handleFileUpload = async () => {
    if (files.length > 0) {
      setSuccessMessage(null);

      const group_id = uuid();
      const sessionIds = [uuid(), uuid(), uuid()];
      setSessionId(sessionIds[0] ?? "");

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
            session_id: sessionIds[i] ?? "",
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

        const url = `/classes/${class_id}/groups/${group_id}/sessions/${sessionIds[0]}?user=${user_id}&className=${selectedClassName}&classID=${class_id}&groupID=${group_id}&sessionID=${sessionIds[0]}`;
        router.push(url);
      } catch (error) {
        onError("Failed to start session");
      }
    } else {
      onError("Select a file to begin.");
    }
  };

  return (
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-[534px] h-[526px] flex flex-col items-center gap-6 bg-white p-6 shadow-lg px-20">
          {/* Uploaded File Display */}
          <div className="w-[534px] h-[297px] relative">
            <div className="w-full h-full bg-[#f9faf9] opacity-50 rounded-[5px] border border-dashed border-[#84988e] absolute"></div>
            {files.length > 0 && (
              <div className="absolute top-[25px] left-[18px] w-[498px] h-14 bg-black/5 rounded flex items-center px-5 gap-8">
                <div className="flex items-center gap-5">
                  <div className="relative w-[29.31px] h-[34px]">
                    <div className="absolute left-[5.86px] top-[7.91px] text-black/30 text-xs font-bold font-['Poppins']">Aa</div>
                  </div>
                  <div className="relative">
                    <div className="text-black/50 text-lg font-semibold font-['DM Sans']">
                      {files[0]?.name}
                    </div>
                    <div className="text-black/20 text-base font-medium font-['DM Sans']">
                      {files[0] && (files[0].size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!files.length && (
              <div className="absolute top-[21px] left-[134.7px] flex flex-col items-center gap-4">
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="fileInput"
                  className="px-4 py-1 bg-[#669880]/10 text-lg font-medium text-[#669880] rounded cursor-pointer font-['DM Sans']"
                >
                  Drag and drop or Browse files
                </label>
              </div>
            )}
          </div>

          {/* Session Naming Section */}
          <div className="w-[508px] flex flex-col items-start gap-8">
            <div className="text-center w-full text-[#000d02] text-2xl font-bold font-['DM Sans']">
              Name your session
            </div>
            <div className="w-[462px] h-[43px] bg-[#f9faf9] rounded-[44px] border border-[#d8dedb] flex items-center px-3">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Enter session title"
                className="w-full text-black/20 text-base font-medium font-['DM Sans'] outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-2.5">
            <button
              onClick={handleFileUpload}
              className="px-10 py-2 bg-[#669880] text-xl font-bold text-white rounded-[5px] font-['DM Sans']"
            >
              Go to my session!
            </button>
            <button onClick={onClose} className="text-sm font-medium text-[#a0b0a8] font-['DM Sans']">
              Cancel
            </button>
          </div>

          {/* Uploading/Processing Messages */}
          {(uploading || processing) && (
            <div className="mt-4 text-center text-sm font-medium text-black">
              {uploading && <p>Uploading...</p>}
              {processing && <p>Processing...</p>}
            </div>
          )}
          {successMessage && (
            <p className="mt-4 text-center text-green-500">{successMessage}</p>
          )}
        </div>
      </div>
    ) : null
  );
}
