import React, { useState, useRef, RefObject } from 'react';
import AWS, { CostExplorer } from 'aws-sdk';
import uuid from 'react-uuid';
import AudioRecorder from './AudioInput';

interface InputFieldProps {
  inputRef: RefObject<HTMLInputElement>;
  inputText: string;
  isGenerating: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleAudioInput: (e: React.FormEvent, audioURL: string) => void;
  handleStopGeneration: () => void;
  uniqueSessionId: string;
}

export default function InputField({
                                     inputRef,
                                     inputText,
                                     isGenerating,
                                     handleInputChange,
                                     handleKeyPress,
                                     handleSubmit,
                                     handleAudioInput,
                                     handleStopGeneration,
                                     uniqueSessionId
                                   }: InputFieldProps) {

  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  const uploadFile = async (file: File) => {
    setUploading(true);
    const S3_BUCKET = "ducki-documents"; // Replace with your bucket name
    const REGION = "us-east-1"; // Replace with your region

    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
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
        index: uniqueSessionId,
      },
    };

    console.log("444", uniqueSessionId)

    try {
      const upload = await s3.putObject(params).promise();
      console.log(upload);
      setUploading(false);
      alert("File uploaded successfully.");
      return file_name;
    } catch (error: any) {
      console.error(error);
      setUploading(false);
      alert("Error uploading file: " + error.message); // Inform user about the error
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
        index: uniqueSessionId,
      }),
    };

    try {
      const response = await lambda.invoke(params).promise();
      console.log(response);
      setProcessing(false);
      alert("File processed successfully.");
    } catch (error: any) {
      console.error(error);
      setProcessing(false);
      alert("Error processing file: " + error.message); // Inform user about the error
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        try {
          if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type");
            return;
          }

          const file_name = await uploadFile(file);
          if (file_name != null) {
            alert(`${file.name} has been uploaded`);
            const process_return = await processFile(file_name);
          } else {
            alert(`Failed to upload file`);
          }
        } catch (error) {
          alert(`Failed to upload file`);
        }
      }
    }
  };

  return (
    <div className="border-12 mb-14 flex w-full items-center bg-transparent p-14">
      
      {/*below is the old + button next to LLM Input for uploading documents, it still functions for future testing*/}
      {/* <div>
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          id="pdf-upload"
          onChange={handleFileChange}
        />
        <label
          htmlFor="pdf-upload"
          className="mx-2 ml-2 cursor-pointer rounded-2xl bg-blue-500 px-4 py-2 text-white"
        >
          +
        </label>
      </div> */}
      <AudioRecorder 
        handleAudioInput={handleAudioInput}
      />
      {(uploading == processing) && <input
        ref={inputRef}
        type="text"
        className="border rounded py-1 px-2 flex-grow text-black text-sm mr-2"
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter your prompt here..."
        aria-label="Text input for LLM prompt"
        disabled={isGenerating}
      />}
      {(uploading != processing) && <div className="border rounded py-1 px-2 flex-grow text-black text-sm mr-2">
        {uploading && <p>Uploading Document</p>}
        {processing && <p>Processing Document</p>}
      </div>}
      <button
        className={`group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition duration-300 ${
          isGenerating ? "bg-red-500" : "bg-[#3a5e4d]"
        }`}
        onClick={isGenerating ? handleStopGeneration : (e) => handleSubmit(e)}
        aria-label={isGenerating ? "Stop Generation" : "Submit prompt to LLM"}
      >
        <div className="transition duration-300 group-hover:rotate-[360deg]">
          {isGenerating ? (
            // Stop (x) icon
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="h-5 w-5 text-[#FEFEFE]">
            <path 
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 18 18 6M6 6l12 12" 
            />
            </svg>
          ) : (
            // Arrow icon
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#FEFEFE]" // Icon color when not generating
            >
              <path
                d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          )}
        </div>
      </button>
      
    </div>
  );
}
