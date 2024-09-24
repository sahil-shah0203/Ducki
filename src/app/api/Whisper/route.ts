import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
    console.log("API route hit");
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

     const formData = await request.formData();
     console.log("formData", formData);
    const audioFile = formData.get('file'); // Get the audio file from FormData
    console.log("audioFile", audioFile);
    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json({ error: "No audio file provided or invalid file format" }, { status: 400 });
    }
    const transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1', // Whisper model
      file: audioFile, // Now it's a File object
      response_format: 'json', // Or 'text' based on your needs
    });

    if (!transcription || !transcription.text) {
      throw new Error('No valid transcription received');
    }

    return NextResponse.json({ transcription: transcription.text });
   // return NextResponse.json({ transcription: "tramscription"});
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}