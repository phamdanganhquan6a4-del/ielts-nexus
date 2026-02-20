import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { PrismaClient } from "@prisma/client";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { topic, question, essay } = await req.json();

    // 1. Gọi AI chấm điểm
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a strict IELTS Writing Examiner. 
          Analyze the essay and return a JSON object with this EXACT structure:
          {
            "overall_score": number (0-9, increments of 0.5),
            "task_response": number,
            "coherence_cohesion": number,
            "lexical_resource": number,
            "grammatical_range": number,
            "general_comment": "string (summary)",
            "detailed_corrections": [
              { "original": "string", "corrected": "string", "explanation": "string" }
            ]
          }
          Return ONLY JSON.`
        },
        {
          role: "user",
          content: `Question: ${question}\n\nEssay: ${essay}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // 2. LƯU VÀO DATABASE (Để hiện lên Dashboard)
    // Skill là 'writing' (viết thường để khớp với biểu đồ)
    const savedResult = await prisma.result.create({
        data: {
            skill: 'writing',
            score: aiResponse.overall_score, // Lưu điểm Overall
            topic: topic || "Writing Practice",
            // Nếu bạn muốn lưu chi tiết bài làm, bạn cần thêm cột vào DB. 
            // Tạm thời ta chỉ lưu điểm để hiện Dashboard.
        }
    });

    // 3. Trả về kết quả cho Frontend hiển thị
    return NextResponse.json({ 
        ...aiResponse, 
        savedId: savedResult.id 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Lỗi chấm bài" }, { status: 500 });
  }
}