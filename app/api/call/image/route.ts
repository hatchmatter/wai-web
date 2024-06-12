import { NextRequest, NextResponse } from "next/server";

import { createImageCompletion } from "@/libs/openai";

export type ImageResponse = {
    imageUrl: string;
  }

export async function POST(req: NextRequest) {
  try {
    // Parse the JSON body
    const { prompt } = await req.json();

    //console.log("Generating Image for prompt:", prompt);

    // Generate the image using the prompt
    const imageUrl = await createImageCompletion(prompt);

    //console.log("Image URL: ", imageUrl);

    // Respond with the generated image URL
    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}