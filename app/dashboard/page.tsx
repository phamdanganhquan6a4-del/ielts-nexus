"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import { ArrowRight, Trophy, Target, BookOpen, Loader2, FileText, MoveRight, Layers, Plus, History, Sparkles, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SkillData {
  skill: string;
  score: number;
  full: number;
}

interface VocabItem {
  id: string;
  word: string;
  definition: string;
  meaning?: string; // Thêm meaning
  level?: string;
  example?: string;
  topic?: string;
}

export default function DashboardPage() {
  const [radarData, setRadarData] = useState<SkillData[]>([]);
  const [overallScore, setOverallScore] = useState("0.0");
  const [isLoading, setIsLoading] = useState(true);
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [newWord, setNewWord] = useState("");
  const [isAddingVocab, setIsAddingVocab] = useState(false);

  async function fetchAllData() {
    try {
      // Gọi đồng thời stats (đã lọc theo User) và vocabulary (đã lọc theo User)
      const [statsRes, vocabRes] = await Promise.all([
        fetch('/api/save-result', { cache: 'no-store' }), // Dùng API save-result để lấy history cá nhân
        fetch('/api/vocabulary', { cache: 'no-store' }) 
      ]);

      const historyData = await statsRes.json();
      const vocabData = await vocabRes.json();

      // LOGIC BƯỚC 3: Tính toán stats cá nhân ngay tại Frontend từ history
      if (Array.isArray(historyData)) {
        const skills = ["reading", "listening", "writing", "speaking"];
        const chartMapped = skills.map(s => {
          const skillResults = historyData.filter((r: any) => r.skill.toLowerCase() === s);
          const avg = skillResults.length > 0 
            ? skillResults.reduce((sum: number, r: any) => sum + r.score, 0) / skillResults.length 
            : 0;
          return { skill: s.toUpperCase(), score: parseFloat(avg.toFixed(1)), full: 9 };
        });
        
        setRadarData(chartMapped);

        const overall = historyData.length > 0
          ? historyData.reduce((sum: number, r: any) => sum + r.score, 0) / historyData.length
          : 0;
        setOverallScore(overall.toFixed(1));
      }

      if (Array.isArray(vocabData)) {
        setVocabList(vocabData.slice(0, 6));
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleQuickAdd = async () => {
    if (!newWord.trim()) return;
    setIsAddingVocab(true);
    try {
      const res = await fetch('/api/vocabulary/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord })
      });
      if (res.ok) {
        setNewWord("");
        await fetchAllData(); 
      }
    } catch (e) {
      console.error("Lỗi thêm từ");
    } finally {
      setIsAddingVocab(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-500 animate-pulse font-bold">Đang tải dữ liệu cá nhân của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-tight">Dashboard</h1>
          <p className="text-slate-500 font-medium italic">Chào mừng trở lại! Dữ liệu dưới đây là của riêng bạn.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/history">
            <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-12 px-6 rounded-xl font-bold transition-all">
              <History className="mr-2 w-4 h-4 text-slate-500" /> Lịch sử
            </Button>
          </Link>
          <Link href="/dashboard/mock-test"> 
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-200/50 h-12 px-8 rounded-xl font-black text-white group border-none">
              <Sparkles className="mr-2 w-4 h-4 animate-pulse" />
              BẮT ĐẦU FULL TEST
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Biểu đồ & Chỉ số */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Radar Chart Cá Nhân */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-slate-800">Biểu đồ năng lực cá nhân</CardTitle>
            <CardDescription>Phân tích dựa trên {radarData.length} kết quả thi gần nhất của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#f1f5f9" strokeWidth={2} />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 9]} tick={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Radar
                    name="My Average Band"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Legend iconType="circle" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cột phải: Overall & Quick Add */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[32px] overflow-hidden relative min-h-[240px] flex items-center">
            <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
            <CardContent className="p-8 w-full relative z-10">
              <div className="flex justify-between items-center mb-6">
                <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">Your Average Band</p>
                <div className="bg-white/10 p-2 rounded-xl">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-8xl font-black leading-none tracking-tighter">{overallScore}</h2>
                <span className="text-slate-400 font-bold text-xl uppercase italic">Band</span>
              </div>
              <div className="mt-8 flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                <Target className="w-5 h-5 text-orange-400" />
                <p className="text-sm font-bold text-slate-200">Mục tiêu cá nhân: <span className="text-white text-lg ml-1">{(parseFloat(overallScore) + 0.5).toFixed(1)}</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-50 rounded-[24px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-500">
                <Plus className="w-4 h-4 text-blue-600" /> Quick Save (AI Powered)
              </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2">
                  <Input 
                    placeholder="VD: Sustainable..." 
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                    className="bg-white h-12 rounded-xl border-slate-200 focus:ring-blue-500"
                  />
                  <Button 
                    onClick={handleQuickAdd} 
                    disabled={isAddingVocab || !newWord} 
                    className="bg-slate-900 hover:bg-black h-12 px-6 rounded-xl font-bold transition-all active:scale-95"
                  >
                    {isAddingVocab ? <Loader2 className="animate-spin w-4 h-4" /> : "Lưu"}
                  </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vocabulary Bank Preview */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Vocab Bank</h3>
            <p className="text-slate-500 font-medium">6 từ vựng bạn đã lưu gần nhất</p>
          </div>
          <Link href="/vocabulary">
            <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 font-black h-10 px-4 rounded-xl">
              Xem tất cả <MoveRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vocabList.length > 0 ? (
            vocabList.map((vocab) => (
              <VocabCard key={vocab.id} vocab={vocab} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100">
               <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold">Chưa có từ vựng nào trong kho cá nhân của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// COMPONENT CARD HIỂN THỊ CHI TIẾT
function VocabCard({ vocab }: { vocab: VocabItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer border-none shadow-sm bg-white hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-2xl text-slate-800 group-hover:text-blue-600 transition-colors capitalize tracking-tight">
                  {vocab.word}
                </h4>
                <p className="text-blue-600 font-bold text-sm mt-1">{vocab.meaning}</p>
              </div>
              {vocab.level && (
                <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
                  {vocab.level}
                </span>
              )}
            </div>
            <p className="text-slate-500 line-clamp-2 leading-relaxed font-medium italic text-xs">
              {vocab.definition}
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
            <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-black uppercase tracking-widest text-blue-100">
                    {vocab.level || "Academic"}
                </span>
                <Sparkles className="w-5 h-5 text-blue-200 opacity-50" />
            </div>
            <DialogTitle className="text-5xl font-black capitalize tracking-tighter">{vocab.word}</DialogTitle>
            <p className="text-2xl font-bold text-blue-200 mt-1">{vocab.meaning}</p>
        </div>
        <div className="p-8 space-y-8 bg-white">
          <div className="space-y-3">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText className="w-3 h-3" /> English Definition
            </h5>
            <div className="p-5 bg-slate-50 rounded-[20px] border border-slate-100 text-slate-700 leading-relaxed font-semibold italic">
              {vocab.definition}
            </div>
          </div>
          {vocab.example && (
            <div className="space-y-3">
              <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Context Example
              </h5>
              <div className="p-6 bg-blue-50/30 rounded-[20px] border border-blue-100/50 relative">
                <p className="text-blue-900 italic font-bold leading-relaxed text-lg">"{vocab.example}"</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}