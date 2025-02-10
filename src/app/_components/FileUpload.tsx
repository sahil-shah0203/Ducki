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

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const redirectedTypes = [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

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
      console.log("File processed:", file_key);
    } catch (error) {
      setProcessing(false);
      onError("Error processing file: " + (error instanceof Error ? error.message : "An unknown error occurred"));
      return null;
    }
  };

  // Client-side code to call the API
  const convertToPdf = async (file: File): Promise<File> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/FileConvert', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Conversion failed');
    }

    // Convert the response to a File object
    const pdfBlob = await response.blob();
    const fileName = file.name.replace(/\.(docx|pptx)$/, '.pdf');

    const url = URL.createObjectURL(pdfBlob);
    console.log("Converted file URL:", url);
    //window.open(url, "_blank");
    
    return new File([pdfBlob], fileName, { type: 'application/pdf' });
  };


  const handleFileUpload = async () => {
    if (files.length > 0) {
      setSuccessMessage(null);

      const group_id = uuid();
      const sessionIds = [uuid(), uuid(), uuid()];
      setSessionId(sessionIds[0] ?? "");
      const currDate = new Date();

      try {
        await addGroup({
          group_id: group_id,
          group_title: sessionTitle || "New Group",
          class_id: class_id,
          user_id: user_id,
          class_name: selectedClassName ?? "",
        });

        console.log("class ID:", class_id)
        console.log(typeof class_id)
        for (let i = 0; i < sessionIds.length; i++) {
          await addSession({
            user_id,
            session_id: sessionIds[i] ?? "",
            session_title: `${sessionTitle} - Session ${i + 1}`,
            group_id: group_id,
            dueDate: currDate,
            class_name: selectedClassName ?? "",
            class_id: class_id,
          });
          currDate.setDate(currDate.getDate() + 1);
          console.log("Session created:", sessionIds[i]);
          console.log("class_name:", selectedClassName ?? "");
          console.log(class_id)
        }

        for (const file of files) {
          if (!allowedTypes.includes(file.type) && !redirectedTypes.includes(file.type)) {
            console.log("Invalid file type", file.type);
            onError("Invalid file type");
            return;
          }
          console.log("File type:", file.type);
          const result = await uploadFile(file, group_id);
          console.log("File uploaded:", result);
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
          <div className="w-[500px] h-[297px] relative">
            <div className="w-full h-full bg-[#f9faf9] opacity-50 rounded-[5px] border border-dashed border-[#84988e] absolute"></div>
            {files.length > 0 && (
              <div className="absolute top-[25px] left-[18px] w-[498px] h-14 bg-black/5 rounded flex items-center px-5 gap-8">
                {files.map((file, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-black text-sm">{file.name}</span>
                    <span className="text-gray-500 text-xs">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                ))}
              </div>
            )}
            {!files.length && (
              <div className="absolute inset-0 flex justify-center items-center">
                {/* Hidden file input */}
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-[266.30px] h-[253.90px] flex flex-col justify-center items-center gap-4">
                  {/* First Row with Rotated 'Aa' Letters */}
                  <div className="opacity-80 flex justify-center items-center gap-0">
                    <div className="w-[72.24px] h-[83.80px] flex justify-center items-center transform rotate-[-30deg]">
                      <img
                        src="\leftFileIcon.svg"
                        alt="LeftFile"
                        className="absolute w-[72.24] h-[83.80] object-cover"
                      />
                      <div className="text-[#d35a4f] text-3xl font-bold font-['Poppins'] z-10">
                        Aa
                      </div>
                    </div>
                    <div className="w-[72.24px] h-[83.80px] flex justify-center items-center">
                      <img
                        src="\middleFileIcon.svg"
                        alt="MiddleFile"
                        className="absolute w-[72.24] h-[83.80] object-cover"
                      />
                      <div className="text-[#d1a60d] text-3xl font-bold font-['Poppins'] z-10">
                        Aa
                      </div>
                    </div>
                    <div className="w-[72.24px] h-[83.80px] flex justify-center items-center transform rotate-[30deg]">
                      <img
                        src="\rightFileIcon.svg"
                        alt="RightFile"
                        className="absolute w-[72.24] h-[83.80] object-cover"
                      />
                      <div className="text-[#8399b0] text-3xl font-bold font-['Poppins'] z-10">
                        Aa
                      </div>
                    </div>
                  </div>

                  {/* Text and Button Section */}
                  <div className="h-[79px] flex flex-col justify-start items-center gap-2">
                    <div className="text-center text-black/30 text-lg font-medium font-['DM Sans'] leading-tight">
                      Drag and drop
                    </div>
                    <div className="opacity-75 text-center text-black/30 text-sm font-medium font-['DM Sans']">
                      or
                    </div>
                    {/* Label to trigger file input */}
                    <label
                      htmlFor="fileInput"
                      className="px-4 py-1 bg-[#669880]/10 rounded flex justify-center items-center gap-2.5 cursor-pointer"
                    >
                      <div className="text-center text-[#669880] text-lg font-medium font-['DM Sans'] leading-tight">
                        Browse files
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Session Naming Section */}
          <div className="w-[508px] flex flex-col items-center gap-8">
            <div className="text-center w-full text-[#000d02] text-2xl font-bold font-['DM Sans']">
              Name your session
            </div>
            <div className="w-[462px] h-[43px] bg-[#f9faf9] rounded-[44px] border border-[#d8dedb] flex items-center px-3">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Enter session title"
                className="w-full bg-transparent text-black/20 text-base font-medium font-['DM Sans'] outline-none"
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
