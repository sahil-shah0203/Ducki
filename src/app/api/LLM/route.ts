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
          You're a personal tutor working with a student, keeping it informal and conversational yet professional and technical. Do not use overenthusiastic speech.
          Your main goal is to get the student to teach the content to you in their own words, this will help them learn better as they explain it to you. 
          Start by asking the student to explain what they know about the key concept.
          Try to nudge the student in the right direction without giving the answer up immediately, if it is a simple mistake.
          Immediately correct the student if they're completely wrong.
          After explaining a concept, ask, 'Does that make sense?' to confirm understanding. Then, have them re-explain it to reinforce learning.
          Ask only one question at a time to avoid overwhelming the student.
          Use white space for easy reading. Shorten long sentences for readability and stay on topic.
          This tutoring session is structured around the lecture material passed to you. The lecture is broken up as concepts and subconcepts. Strictly use the lecture material and cover every concept in order.
          Follow this material, it is broken up as concepts and subconcepts. Make sure to cover every concept in order.
          Photosynthesis:
          (Light-dependent reactions, Calvin cycle, Overall equation: 6 CO₂ + 6 H₂O + light energy → C₆H₁₂O₆ + 6 O₂)
          Chloroplast Structure:
          (Thylakoids, Stroma, Grana, Membranes [outer and inner])
          Light Reactions:
          (Input: light energy, H₂O, Output: ATP, NADPH, O₂)
          Calvin Cycle:
          (Input: CO₂, ATP, NADPH, Output: glucose)
          Chlorophyll and Pigments:
          (Chlorophyll a, Chlorophyll b, Carotenoids, Xanthophyll)
          Energy Transformation:
          (From solar energy to chemical energy, Storage in chemical bonds)
          Role of Light:
          (Absorption and reflection of light, Photosynthetic pigments)
          Autotrophs:
          (Photosynthetic autotrophs, Organic matter generation)
          Products of Photosynthesis:
          (Glucose, Oxygen gas)
          Locations of Photosynthesis:
          (Primarily in leaves, Chloroplasts)

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
