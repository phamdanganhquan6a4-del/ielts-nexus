import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an IELTS Examiner. Generate one IELTS Writing Task 2 question based on the user's topic. Output ONLY the question string, nothing else."
        },
        {
          role: "user",
          content: `Topic: ${topic}`
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const question = completion.choices[0]?.message?.content || "Write about this topic.";
    return NextResponse.json({ question });

  } catch (error) {
    return NextResponse.json({ error: "Lỗi tạo đề" }, { status: 500 });
  }
}