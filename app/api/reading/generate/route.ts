import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra xem có Key chưa
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ LỖI: Chưa có GROQ_API_KEY trong file .env.local");
      return NextResponse.json({ error: 'Missing API Key in Server' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { topic } = await req.json();

    console.log(`🤖 Đang tạo bài thi cho chủ đề: ${topic}...`);

    const prompt = `
      Create an IELTS Reading test about: "${topic}".
      
      1. Write a 300-word academic passage about this topic.
      2. Create 5 Multiple Choice Questions based on the passage.
      
      OUTPUT MUST BE STRICT JSON format like this:
      {
        "title": "Title of the passage",
        "passage": "Full content of the passage...",
        "questions": [
          {
            "id": 1,
            "text": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A"
          }
        ]
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile', // Dùng model 70b cho thông minh
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
       throw new Error("AI trả về dữ liệu rỗng!");
    }

    const data = JSON.parse(content);
    return NextResponse.json(data);

  } catch (error: any) {
    // --- QUAN TRỌNG: In lỗi chi tiết ra Terminal của VS Code ---
    console.error("🔥 LỖI BACKEND CHI TIẾT:", error);
    
    return NextResponse.json({ 
      error: error.message || 'Failed to generate test',
      details: error.toString() 
    }, { status: 500 });
  }
}