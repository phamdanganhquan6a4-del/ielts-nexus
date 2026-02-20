"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, PenTool, CheckCircle, ArrowRight, BookOpen, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WritingPage() {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [essay, setEssay] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  // Bước 1: Tạo đề bài
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/writing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.question) {
        setQuestion(data.question);
        setStep(2);
      }
    } catch (e) {
      alert("Lỗi kết nối server.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Bước 2: Chấm bài (Dùng đúng cấu trúc API bạn cung cấp)
  const handleSubmit = async () => {
    if (!essay.trim()) return;
    setIsGrading(true);
    try {
      const res = await fetch("/api/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, question, essay }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setResult(data); // Nhận JSON có overall_score, general_comment, detailed_corrections...
        setStep(3);
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (e) {
      alert("Lỗi kết nối.");
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Writing Simulator</h2>
        <p className="text-muted-foreground">Quy trình: Topic → Đề bài → Chấm điểm.</p>
      </div>

      {step === 1 && (
        <Card className="max-w-xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PenTool className="w-5 h-5 text-blue-600"/> Chủ đề luyện tập</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="VD: Environment, Education..." value={topic} onChange={(e) => setTopic(e.target.value)} />
            <Button onClick={handleGenerate} disabled={isGenerating || !topic} className="w-full bg-blue-600">
              {isGenerating ? <Loader2 className="animate-spin mr-2" /> : "Tạo đề bài"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4">
          <Card className="lg:col-span-1 bg-blue-50">
            <CardContent className="p-6">
              <Badge className="mb-2">{topic}</Badge>
              <p className="font-medium text-lg">{question}</p>
            </CardContent>
          </Card>
          <div className="lg:col-span-2 space-y-4">
            <Textarea 
                className="min-h-[400px] p-6 text-lg font-serif" 
                value={essay} 
                onChange={(e) => setEssay(e.target.value)} 
                placeholder="Viết bài làm của bạn..."
            />
            <Button onClick={handleSubmit} disabled={isGrading || !essay} className="w-full bg-green-600 h-12">
              {isGrading ? <Loader2 className="animate-spin mr-2" /> : "Nộp bài & Chấm điểm"}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-6 animate-in zoom-in-95">
          {/* HIỂN THỊ ĐIỂM (Sử dụng đúng Key từ API) */}
          <Card className="border-t-4 border-t-blue-600 shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Kết quả đánh giá</h2>
                <div className="text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Overall Band</p>
                    <p className="text-6xl font-black text-blue-600">{result.overall_score}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreBox label="Task Response" score={result.task_response} />
                <ScoreBox label="Coherence" score={result.coherence_cohesion} />
                <ScoreBox label="Lexical" score={result.lexical_resource} />
                <ScoreBox label="Grammar" score={result.grammatical_range} />
              </div>
            </CardContent>
          </Card>

          {/* NHẬN XÉT (Sử dụng general_comment) */}
          <Card className="bg-slate-50">
            <CardHeader><CardTitle className="text-base">Nhận xét tổng quan</CardTitle></CardHeader>
            <CardContent><p className="text-slate-700 leading-relaxed">{result.general_comment}</p></CardContent>
          </Card>

          {/* SỬA LỖI (Sử dụng detailed_corrections) */}
          <div className="space-y-4">
            <h3 className="font-bold">Chi tiết lỗi & Cách sửa</h3>
            {result.detailed_corrections?.map((item: any, index: number) => (
              <Card key={index} className="border-l-4 border-l-red-400">
                <CardContent className="p-4 space-y-2 text-sm">
                  <p className="text-red-500 line-through">❌ {item.original}</p>
                  <p className="text-green-700 font-semibold">✅ {item.corrected}</p>
                  <p className="text-slate-500 italic">💡 {item.explanation}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={() => setStep(1)} variant="outline" className="w-full"><RefreshCcw className="mr-2 w-4 h-4"/> Làm bài mới</Button>
        </div>
      )}
    </div>
  );
}

function ScoreBox({ label, score }: { label: string, score: number }) {
  return (
    <div className="bg-white p-3 rounded-lg text-center border">
      <div className="text-[10px] font-bold text-slate-400 uppercase">{label}</div>
      <div className="text-xl font-bold text-slate-800">{score}</div>
    </div>
  )
}