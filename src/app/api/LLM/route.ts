import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Takes in user input
    const params = await request.json();

    // Sending to ChatGPT
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Ducki AI, a helpful learning assistant for college students. Pretend that you are a professor guiding an eager student through their studies. Your responses should mimic the discussion that takes place during office hours for college classes. Please be short, succinct, and informative in your responses. Be sure to encourage further discussion from the user, and provide helpful resources when necessary.",
        },
        ...params.chatHistory, // Pass the chat history
      ],
      temperature: 0,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return NextResponse.json(response); // Ensure you return the correct response
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
