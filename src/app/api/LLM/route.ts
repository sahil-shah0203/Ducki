import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import AWS from 'aws-sdk';

export async function POST(request: Request) {
  console.log("POST CALLED");
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Takes in user input
    const params = await request.json();

    const prompt = params.prompt;
    const session = params.session;

    console.log("Session:", session);

    // pass prompt into aws lambda function
    console.log("Calling Lambda for context");
    const lambda = new AWS.Lambda({
      region: "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }); 

    let context;

    const lambda_params = {
      FunctionName: 'prompt_model',
      Payload: JSON.stringify({
        prompt: prompt,
        index: session
      }),
    };
    try {
      const result = await lambda.invoke(lambda_params).promise();
      const response = JSON.parse(result.Payload as string);
      console.log("Lambda response:", response);
      if (response.statusCode === 200 && response.body) {
        const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
        if (body.status === 'success') {
          context = body.model_reponse;
        } else {
          throw new Error('Lambda response status not successful');
        }
      } else {
        throw new Error('Invalid Lambda response');
      }
    } catch (err) {
      context = "";
    }

    console.log("Context is:", context);

    const chatHistory = params.chatHistory;
    const customPrompt = {
      role: "user",
      content: "Context: \n" + context + "\n\n" + "Prompt: \n" + prompt,
    };

    console.log("Chat history:", chatHistory);
    console.log("Custom prompt:", customPrompt);

    let messages = [customPrompt, ...chatHistory].reverse();

    console.log("Messages:", messages);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Ducki AI, a helpful learning assistant for college students. Pretend that you are a professor guiding an eager student through their studies. Your responses should mimic the discussion that takes place during office hours for college classes. Please be short, succinct, and informative in your responses. Be sure to encourage further discussion from the user, and provide helpful resources when necessary.",
        },
        ...messages,
      ],
      temperature: 0,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        for await (const chunk of response) {
          controller.enqueue(chunk.choices[0]?.delta?.content || "");
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
