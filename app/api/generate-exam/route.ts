import { NextResponse } from 'next/server'; // Dùng 'next/server' cho API Route
import Groq from "groq-sdk";

// Khởi tạo Groq với API Key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an IELTS exam creator. You must always respond in valid JSON format. Do not include any conversational text outside the JSON."
        },
        {
          role: "user",
          content: `Create a full IELTS Mock Test about the topic: "${topic}".
          The response must be a JSON object with this exact structure:
          {
            "listening": { 
              "script": "text content for audio", 
              "questions": [{ "q": "question text", "options": ["A", "B", "C", "D"], "answer": "correct option" }] 
            },
            "reading": { 
              "title": "passage title", 
              "passage": "long academic text", 
              "questions": [{ "q": "question text", "answer": "short answer" }] 
            },
            "writing": { "task2_prompt": "essay prompt" },
            "speaking": { "part1": ["q1", "q2"], "part3": ["q3", "q4"] }
          }`
        }
      ],
      // Sử dụng model llama3 hoặc miitral của Groq (tốc độ cực nhanh)
      model: "llama-3.3-70b-versatile", 
      // Ép kiểu phản hồi là JSON (Groq hỗ trợ tốt việc này)
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from Groq");
    }

    // Với response_format: { type: "json_object" }, 
    // content thường đã là chuỗi JSON sạch, không cần regex xóa markdown
    const examData = JSON.parse(content);

    return NextResponse.json(examData);
  } catch (error: any) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate exam", details: error.message }, 
      { status: 500 }
    );
  }
}