import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const params = await request.json();
    const prompt = params.prompt;
    const session = params.session;

    const lambda = new LambdaClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    let context;
    const lambdaParams = {
      FunctionName: 'prompt_model',
      Payload: JSON.stringify({
        prompt: prompt,
        index: session
      }),
    };

    try {
      const command = new InvokeCommand(lambdaParams);
      const result = await lambda.send(command);
      const response = JSON.parse(new TextDecoder("utf-8").decode(result.Payload));
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

    const chatHistory = params.chatHistory;
    const customPrompt = {
      role: "user",
      content: "Context: \n" + context + "\n\n" + "Prompt: \n" + prompt,
    };

    const messages = [customPrompt, ...chatHistory].reverse();

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: 
          `
          You are Ducki AI, a personal tutor for a student. Currently, you are in a 10-minute,
          quick review session with them. You are to speak to the student unprompted and provide
          guidance by asking questions about the course material. This material will be provided
          to you as context. Your main goal is to get the student to teach the content to you
          in their own words, this will help them learn better as they explain it to you. If
          any information is incorrect, please correct them in a very polite and jovial manner.
          Try to nudge the student in the right direction without giving the answer upimmediately, if it is a simple mistake.
          If you are unsure about any information, tell the student you do not know the answer.
          Please make sure that this tutoring session only takes around 10 minutes, once
          you think the student knows the information pretty well, and there is not much
          left to correct them on, please conclude by saying “Wow you seem to know your
          course material well! Your session is now complete. I will schedule some more
          sessions so you don’t forget what we went over today, and you may feel free
          to ask any more questions or exit the page. Thank you!”
          `,
           },
        ...messages,
      ],
      temperature: 0,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const result = response.choices?.[0]?.message?.content;
    if (!result) {
      throw new Error('No valid response choices available');
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
