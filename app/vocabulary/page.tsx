"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, BookOpen, FileText, Layers, Loader2, Frown, Trash2, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// 1. CẬP NHẬT INTERFACE: Thêm trường meaning
interface VocabItem {
  id: string;
  word: string;
  definition: string;
  meaning?: string; // <-- Thêm trường này
  level?: string;
  example?: string;
  topic?: string;
}

export default function VocabularyPage() {
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [filteredList, setFilteredList] = useState<VocabItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVocab() {
      try {
        const res = await fetch('/api/vocabulary');
        if (res.ok) {
          const data = await res.json();
          setVocabList(data);
          setFilteredList(data);
        }
      } catch (error) {
        console.error("Lỗi tải từ vựng:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVocab();
  }, []);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = vocabList.filter((item) => 
      item.word.toLowerCase().includes(lowerQuery) || 
      item.definition.toLowerCase().includes(lowerQuery) ||
      item.meaning?.toLowerCase().includes(lowerQuery) || // Tìm cả trong nghĩa tiếng Việt
      (item.topic && item.topic.toLowerCase().includes(lowerQuery))
    );
    setFilteredList(filtered);
  }, [searchQuery, vocabList]);

  const handleDelete = async (id: string, word: string) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa từ "${word}" khỏi kho từ vựng không?`);
    if (!confirmDelete) return;

    setIsDeleting(id);
    try {
      const res = await fetch('/api/vocabulary', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        const updatedList = vocabList.filter((v) => v.id !== id);
        setVocabList(updatedList);
      } else {
        alert("Có lỗi xảy ra khi xóa.");
      }
    } catch (error) {
      alert("Không thể kết nối tới server.");
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Đang tải kho từ vựng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-200 h-12 w-12">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-blue-600" /> Kho Từ Vựng
              </h1>
              <p className="text-slate-500 font-medium">
                Tổng cộng: <span className="font-bold text-blue-600">{vocabList.length}</span> từ đã lưu
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm từ, nghĩa, chủ đề..." 
              className="pl-12 h-12 rounded-2xl bg-white shadow-sm border-slate-200 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- GRID TỪ VỰNG --- */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
            {filteredList.map((vocab) => (
              <Dialog key={vocab.id}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-xl hover:shadow-blue-100 hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 border-slate-200 bg-white rounded-3xl">
                    <CardContent className="p-6 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-black text-xl text-slate-800 capitalize">
                            {vocab.word}
                          </h3>
                          {vocab.level && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                              {vocab.level}
                            </span>
                          )}
                        </div>
                        {/* HIỂN THỊ NGHĨA TIẾNG VIỆT NGAY TRÊN CARD */}
                        <p className="text-sm font-bold text-blue-600 mb-2 line-clamp-1">
                          {vocab.meaning || "Chưa có nghĩa"}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2 font-medium italic">
                          {vocab.definition}
                        </p>
                      </div>
                      
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-bold text-slate-600">
                          {vocab.topic || "Academic"}
                        </span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                {/* --- POPUP CHI TIẾT --- */}
                <DialogContent className="sm:max-w-[550px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                  <div className="bg-slate-50 p-8 border-b border-slate-100 relative">
                    <div className="flex items-start justify-between pr-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <DialogTitle className="text-4xl font-black text-blue-700 capitalize">{vocab.word}</DialogTitle>
                          <span className="px-3 py-1 bg-white border rounded-xl text-xs font-black text-slate-700">{vocab.level}</span>
                        </div>
                        <DialogDescription className="text-base font-bold text-slate-500">
                          {vocab.topic}
                        </DialogDescription>
                      </div>

                      <Button
                        variant="destructive"
                        className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl h-10 px-4 font-bold transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(vocab.id, vocab.word);
                        }}
                        disabled={isDeleting === vocab.id}
                      >
                        {isDeleting === vocab.id ? <Loader2 className="animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Xóa
                      </Button>
                    </div>
                  </div>

                  <div className="p-8 grid gap-6 bg-white">
                    {/* NGHĨA TIẾNG VIỆT TRONG POPUP */}
                    <div className="space-y-3">
                      <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <Languages className="w-4 h-4 text-emerald-500" /> Nghĩa tiếng Việt
                      </h4>
                      <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 text-lg font-bold">
                        {vocab.meaning || "Đang cập nhật..."}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <FileText className="w-4 h-4 text-blue-500" /> Định nghĩa (English)
                      </h4>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 font-medium italic">
                        {vocab.definition}
                      </div>
                    </div>

                    {vocab.example && (
                      <div className="space-y-3">
                        <h4 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-widest">
                          <Layers className="w-4 h-4 text-orange-500" /> Ví dụ ngữ cảnh
                        </h4>
                        <div className="p-5 bg-orange-50/50 rounded-2xl border border-orange-100 text-slate-700 italic relative font-medium">
                          <span className="absolute top-2 left-2 text-5xl text-orange-200/40 font-serif">"</span>
                          <span className="relative z-10">{vocab.example}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <Frown className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900">Không tìm thấy từ nào</h3>
          </div>
        )}
      </div>
    </div>
  );
}