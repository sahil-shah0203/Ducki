import React, { useState, useEffect, useRef } from 'react';

interface AudioRecorderProps {
  isRecording: boolean;
  audioURL: string | null;
}
export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioURL(audioUrl);
          audioChunksRef.current = [];
        };
        mediaRecorderRef.current.start();
      });
    } else {
      mediaRecorderRef.current?.stop();
      console.log(audioURL);
      //nputText = audioURL;
    }
  }, [isRecording]);

  return (
    <div className="flex items-center bg-transparent mr-2">
    <button
  className={`group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition duration-300 ${
    isRecording ? "bg-red-500" : "bg-[#3a5e4d]"
  }`}
  onClick={() => setIsRecording(prev => !prev)}
  aria-label={"Record input"}
>
  {isRecording ? (
    <div className="flex space-x-1">
      <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce delay-75" />
      <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce delay-150" />
      <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce delay-225" />
    </div>
  ) : (
    <div className="transition duration-300 group-hover:rotate-[360deg]">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-5 w-5 text-[#FEFEFE]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
        />
      </svg>
    </div>
  )}
</button>

<style>
{`
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @keyframes bounce {
    0%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
  }

  .animate-bounce {
    animation: bounce 0.6s infinite;
  }
`}
</style>
      {audioURL && <audio controls src={audioURL} />}
      </div>
  );
}