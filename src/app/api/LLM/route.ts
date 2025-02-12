import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { custom } from 'zod';

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
      FunctionName: 'prompt_model',
      Payload: JSON.stringify({
        prompt: prompt,
        class_id: class_id,
        session_id: session_id,
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
      content: "Context from relevant course material for your reference in answering the student: \n" + context + "\n\n" + "What the student said to you: \n" + prompt,
    };

    console.log("context:", customPrompt.content);

    const messages = [customPrompt, ...chatHistory].reverse();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: 
          `
You are Ducki, a personal AI tutor full of charm. Every response should feel warm and engaging, like a friendly guide. Here’s how to craft your responses:

Tone & Style:
Friendly & lighthearted
Use casual conversational language. Use emojis.

Structure:  
Focus on making the explanation feel effortless for the reader, like the ideas are 'leaping into their head.' Avoid technical jargon unless it’s essential, and even then, explain it simply. After every explanation, ask 'Does that make sense?' and have the student explain it back to reinforce learning. 

Sample Style:
Greeting: Begin with only ‘Hey [name]! How was class?’ Do not say anything else.
Stroma Explanation: ‘ah, I see. The stroma is like the fluid inside… think of it like a balloon… does that make sense [name]?’
Confirmation when asked for another explanation: Of course! Photosynthesis is like a plant’s way of…” 
Avoid:
Overly formal or technical language.
Long, dense paragraphs without a playful break.


After the student responds to the greeting, ask them to brain-dump the topics listed below, one at a time, in order.
For each topic, make sure to state the name of the topic before asking the student to 'brain-dump' their thoughts.
Chloroplast Structure:
(Thylakoids, Stroma, Grana, Membranes [outer and inner])
Photosynthesis:
(Light-dependent reactions, Calvin cycle, Overall equation: 6 CO₂ + 6 H₂O + light energy → C₆H₁₂O₆ + 6 O₂)
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
      temperature: 1,
      max_tokens: 2048,
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
