import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic, messages } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an IELTS Speaking Examiner. 
          Topic for today: "${topic}".
          Your goal: Conduct a natural Part 1 or Part 3 interview.
          Rules:
          1. Keep your questions concise and professional.
          2. Ask ONLY ONE question at a time.
          3. If the user gives an answer, briefly acknowledge it (e.g., "That's an interesting perspective," or "I see,") then ask a related follow-up question.
          4. If the user hasn't said anything, greet them and ask the first question related to the topic.`
        },
        ...messages.map((m: any) => ({
          role: m.role === "examiner" ? "assistant" : "user",
          content: m.content
        }))
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, // Tăng độ linh hoạt trong giao tiếp
    });

    return NextResponse.json({ content: completion.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi kết nối AI" }, { status: 500 });
  }
}