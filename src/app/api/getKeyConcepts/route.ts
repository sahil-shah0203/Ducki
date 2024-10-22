import { NextResponse } from "next/server";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export async function POST(request: Request) {
  try {
    // Extract the prompt and session ID from the request body
    const params = await request.json();
    const session = params.session;
    const class_id = params.class_id;

    // Initialize the AWS Lambda client
    const lambda = new LambdaClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    let concepts = [];

    // Prepare parameters for invoking the Lambda function
    const lambdaParams = {
      FunctionName: "prompt_model",
      Payload: JSON.stringify({
        task: "topics", // Set the task to 'topics'
        class_id: class_id, // Set the class ID to 'default'
        session_id: session, // Pass the session ID as index
      }),
    };

    try {
      // Invoke the Lambda function
      const command = new InvokeCommand(lambdaParams);
      const result = await lambda.send(command);

      // Decode and parse the response payload
      const response = JSON.parse(
        new TextDecoder("utf-8").decode(result.Payload),
      );

      // Check for a successful response from Lambda
      if (response.statusCode === 200 && response.body) {
        const body =
          typeof response.body === "string"
            ? JSON.parse(response.body)
            : response.body;
        if (body.status === "success") {
          concepts = body.model_reponse; // Assign the list of concepts
        } else {
          throw new Error("Lambda response status not successful");
        }
      } else {
        throw new Error("Invalid Lambda response");
      }
    } catch (err) {
      concepts = [];
    }

    // Return the list of concepts as the response
    return NextResponse.json({ concepts });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
