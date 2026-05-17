import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Initialize the SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 });
    }

    const { imageBase64, language } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    // Load the prompt from the Markdown asset and inject variables
    const promptPath = path.join(process.cwd(), 'src/prompts/vision_prompt.md');
    const rawPrompt = fs.readFileSync(promptPath, 'utf8');
    const prompt = rawPrompt.replace('{{TARGET_LANGUAGE}}', language);

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const responseText = result.response.text();

    // Attempt to parse the JSON (removing markdown blocks if any exist despite instructions)
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(cleanedText);

    return NextResponse.json(json);

  } catch (error: any) {
    console.error("Error analyzing image:", error);
    return NextResponse.json({ error: error.message || 'Failed to analyze image' }, { status: 500 });
  }
}
