"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mic, MicOff, Volume2, Save, RefreshCcw } from "lucide-react";

interface Message {
  role: "examiner" | "candidate";
  content: string;
}

export default function SpeakingPage() {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const recognitionRef = useRef<any>(null);

  // --- HÀM PHÁT ÂM (AI SPEAKING) ---
  const speak = (text: string) => {
    window.speechSynthesis.cancel(); // Dừng các câu đang nói dở
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    
    // Tự động bật lại mic sau khi giám khảo nói xong câu hỏi
    utterance.onend = () => {
      console.log("Examiner finished speaking.");
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // --- KHỞI TẠO RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // QUAN TRỌNG: Gọi handleUserAnswer thông qua một hàm trung gian 
        // để tránh lỗi closure bám vào state cũ
        document.dispatchEvent(new CustomEvent("user-speech", { detail: transcript }));
      };

      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // Lắng nghe sự kiện speech để cập nhật handleUserAnswer với state mới nhất
  useEffect(() => {
    const handleSpeech = (e: any) => handleUserAnswer(e.detail);
    document.addEventListener("user-speech", handleSpeech);
    return () => document.removeEventListener("user-speech", handleSpeech);
  }, [messages, topic]);

  // --- BƯỚC 1: KHỞI TẠO BÀI THI ---
  const startTest = async () => {
    if (!topic) return;
    setIsLoading(true);
    setStep(2);
    try {
      const res = await fetch("/api/speaking/chat", {
        method: "POST",
        body: JSON.stringify({ topic, messages: [] }),
      });
      const data = await res.json();
      const firstMsg = { role: "examiner" as const, content: data.content };
      setMessages([firstMsg]);
      speak(data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- BƯỚC 2: XỬ LÝ CÂU TRẢ LỜI ---
  const handleUserAnswer = async (userText: string) => {
    // 1. Cập nhật danh sách tin nhắn ngay lập tức (local variable)
    const newMessages: Message[] = [...messages, { role: "candidate", content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    // Kiểm tra nếu đã trả lời đủ 4 câu thì kết thúc luôn
    const candidateAnswers = newMessages.filter(m => m.role === "candidate").length;
    if (candidateAnswers >= 4) {
      await finishTest(newMessages);
      return;
    }

    // 2. Gọi AI lấy câu hỏi tiếp theo
    try {
      const res = await fetch("/api/speaking/chat", {
        method: "POST",
        body: JSON.stringify({ topic, messages: newMessages }),
      });
      const data = await res.json();
      
      const examinerMsg = { role: "examiner" as const, content: data.content };
      setMessages([...newMessages, examinerMsg]);
      speak(data.content);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  // --- BƯỚC 3: CHẤM ĐIỂM & LƯU DB ---
  const finishTest = async (finalMessages: Message[]) => {
    setIsLoading(true);
    const transcriptString = finalMessages
      .map(m => `${m.role === "examiner" ? "Examiner" : "Candidate"}: ${m.content}`)
      .join("\n");

    try {
      const res = await fetch("/api/speaking/grade", {
        method: "POST",
        body: JSON.stringify({ topic, transcript: transcriptString }),
      });
      const data = await res.json();
      setResult(data);
      setStep(3);
    } catch (error) {
      alert("Lỗi chấm điểm!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl min-h-[80vh] flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">IELTS AI Speaking Examiner</h1>

      {step === 1 && (
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Hôm nay bạn muốn luyện chủ đề gì?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              className="h-12 text-lg"
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              placeholder="VD: Robots, Environment, My Hometown..." 
            />
            <Button onClick={startTest} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700" disabled={!topic || isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Bắt đầu bài thi"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="h-[400px] space-y-4 p-6 border rounded-2xl bg-white shadow-inner overflow-y-auto flex flex-col">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "examiner" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  m.role === "examiner" 
                  ? "bg-slate-100 text-slate-800 rounded-tl-none border shadow-sm" 
                  : "bg-blue-600 text-white rounded-tr-none shadow-md"
                }`}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                    {m.role === "examiner" ? "Examiner" : "You"}
                  </p>
                  <p className="text-base leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              className={`rounded-full w-20 h-20 shadow-2xl transition-all ${
                isRecording ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={toggleRecording}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
            <p className={`font-medium ${isRecording ? "text-red-500 animate-pulse" : "text-slate-400"}`}>
              {isRecording ? "Đang lắng nghe bài nói của bạn..." : "Nhấn Micro để bắt đầu trả lời"}
            </p>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <Card className="animate-in zoom-in-95 border-t-8 border-t-blue-600 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Overall Band Score</p>
            <CardTitle className="text-7xl font-black text-blue-600 my-2">{result.overall_score}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
               <ScoreTag label="Fluency" score={result.fluency} />
               <ScoreTag label="Lexical" score={result.lexical} />
               <ScoreTag label="Grammar" score={result.grammar} />
               <ScoreTag label="Pronunciation" score={result.pronunciation} />
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
               <h4 className="font-bold text-blue-800 mb-1 text-sm flex items-center gap-2">
                 <Volume2 className="w-4 h-4"/> Examiner's Feedback
               </h4>
               <p className="text-slate-700 text-sm leading-relaxed italic">"{result.feedback}"</p>
            </div>
            <Button onClick={() => setStep(1)} className="w-full h-12 gap-2" variant="outline">
              <RefreshCcw className="w-4 h-4"/> Luyện tập chủ đề mới
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScoreTag({ label, score }: { label: string, score: number }) {
  return (
    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
      <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-lg font-bold text-slate-800">{score}</span>
    </div>
  );
}