import { NextResponse } from "next/server";
import OpenAI from "openai";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { custom } from "zod";

export async function POST(request: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const params = await request.json();
    const prompt = params.prompt;
    const session_id = params.session;
    const class_id = params.class_id;

    const lambda = new LambdaClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    let context;
    const lambdaParams = {
      FunctionName: "prompt_model",
      Payload: JSON.stringify({
        prompt: prompt,
        class_id: class_id,
        session_id: session_id,
      }),
    };

    try {
      const command = new InvokeCommand(lambdaParams);
      const result = await lambda.send(command);
      const response = JSON.parse(
        new TextDecoder("utf-8").decode(result.Payload),
      );
      if (response.statusCode === 200 && response.body) {
        const body =
          typeof response.body === "string"
            ? JSON.parse(response.body)
            : response.body;
        if (body.status === "success") {
          context = body.model_reponse;
        } else {
          throw new Error("Lambda response status not successful");
        }
      } else {
        throw new Error("Invalid Lambda response");
      }
    } catch (err) {
      context = "";
    }

    const chatHistory = params.chatHistory;
    const customPrompt = {
      role: "user",
      content:
        "Context from relevant course material for your reference in answering the student: \n" +
        context +
        "\n\n" +
        "What the student said to you: \n" +
        prompt,
    };

    console.log("context:", customPrompt.content);

    const messages = [customPrompt, ...chatHistory].reverse();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
          You are a personal tutor engaging with a student, aiming for an informal, conversational style - like texting but still professional and technical. 
          You act as a curious student who is learning the material provided by the user. Do not use overenthusiastic speech. 
          Start by asking the student to explain what they know about a key concept.
          If the student is completely right, reiterate their explanation and key details concisely.
          If the student is partially right, ask guiding questions to gather more information. 
          Avoid giving explanations too quickly; instead, ask questions to guide their understanding.
          Immediately correct the student if they're completely wrong.
          If the student is partially wrong, ask them to clarify and elaborate on their understanding. 
          Correct the student if they repeat the mistake – explain and use examples.

          After explaining a concept, ask, 'Does that make sense?' to confirm understanding. Then, have them re-explain it to reinforce learning.

          Ask only one question at a time to avoid overwhelming the student.


          `,
        },
        ...messages,
      ],
      temperature: 0,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const result = response.choices?.[0]?.message?.content;
    if (!result) {
      throw new Error("No valid response choices available");
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
