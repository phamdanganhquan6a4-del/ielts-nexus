"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  PlayCircle, Square, Mic, Send, Clock, 
  CheckCircle2, Loader2, Trophy, RotateCcw, Home, AlertCircle
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ExamStep = "setup" | "generating" | "written" | "speaking" | "results";

interface MockTestProps {
  initialTopic?: string;
  onTestComplete?: (results: any) => void;
  onCancel?: () => void;
}

export default function MockTest({ initialTopic = "", onTestComplete, onCancel }: MockTestProps) {
  const [step, setStep] = useState<ExamStep>(initialTopic ? "generating" : "setup");
  const [topic, setTopic] = useState(initialTopic);
  const [examData, setExamData] = useState<any>(null);
  
  const [timeLeft, setTimeLeft] = useState(150 * 60);
  
  const [answers, setAnswers] = useState({
    listening: {} as Record<number, string>,
    reading: {} as Record<number, string>,
    writing: "",
  });
  
  const [recordings, setRecordings] = useState<Record<number, Blob>>({});
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [finalScores, setFinalScores] = useState<any>(null);

  useEffect(() => {
    if (initialTopic && step === "generating") {
      handleGenerateExam();
    }
  }, [initialTopic]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "written" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && step === "written") {
      finishWrittenPhase();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  // --- MÔ PHỎNG AI TẠO ĐỀ (Cập nhật Khó hơn & Dài hơn) ---
  const handleGenerateExam = () => {
    if (!topic.trim()) return;
    setStep("generating");
    
    setTimeout(() => {
      setExamData({
        listening: {
          script: `Welcome to the advanced IELTS mock test lecture. Today's session delves deep into the multifaceted domain of ${topic}. Over the past decade, ${topic} has not only revolutionized our fundamental understanding of societal structures but also introduced highly complex challenges. We will explore three main paradigms today: its historical context, contemporary applications, and future trajectories. \n\nFirst, examining the early adoption phases reveals a landscape fraught with skepticism. However, as contemporary applications demonstrated unprecedented efficiency, global markets rapidly integrated these principles. Nevertheless, experts argue that mitigating upcoming risks requires proactive legislation rather than reactive measures. If we look at the statistical projections for the next twenty years, the infrastructural demands alone will require trillions of dollars in global investments.`,
          questions: [
            { q: "What is the primary focus of today's lecture?", options: [`The multifaceted domain of ${topic}`, "Basic societal structures", "Historical mistakes", "Future technologies"], answer: `The multifaceted domain of ${topic}` },
            { q: "What has changed over the past decade according to the speaker?", options: ["Fundamental understanding of societal structures", "Nothing significant", "The global economy", "Educational paradigms"], answer: "Fundamental understanding of societal structures" },
            { q: "What is required to mitigate upcoming risks?", options: ["Proactive legislation", "Reactive measures", "Financial investments", "Ignoring the problems"], answer: "Proactive legislation" },
            { q: "How many main paradigms will the lecture explore?", options: ["Three", "Two", "Four", "Five"], answer: "Three" },
            { q: "What will require trillions of dollars in investments?", options: ["Infrastructural demands", "Educational reforms", "Space exploration", "Military defense"], answer: "Infrastructural demands" }
          ]
        },
        reading: {
          passage: `THE EVOLUTION AND IMPACT OF ${topic.toUpperCase()} IN CONTEMPORARY SOCIETY\n\nIn recent years, the proliferation of ${topic} has sparked considerable debate among scholars and industry leaders alike. While proponents argue that ${topic} serves as a catalyst for unprecedented innovation, critics warn of its potential to disrupt established socio-economic frameworks.\n\nOne of the most profound impacts of ${topic} can be observed in the sector of automation and human resources. Studies indicate a paradigm shift where traditional roles are being augmented, or in some cases, entirely replaced. However, this transition is not without its merits. The integration of ${topic} has led to exponential increases in efficiency and the creation of entirely new, highly specialized industries.\n\nFurthermore, the environmental implications of ${topic} present a distinct dichotomy. On one hand, advanced analytics enable optimized resource management, reducing waste substantially; on the other, the immense infrastructural demands contribute significantly to rising carbon footprints. Addressing this imbalance is paramount for sustainable development. Ultimately, the future trajectory of ${topic} will depend largely on international regulatory policies and rigid ethical considerations.`,
          questions: [
            { q: "What has the proliferation of the topic sparked among scholars?", options: ["Considerable debate", "Global wars", "Economic collapse", "Universal agreement"], answer: "Considerable debate" },
            { q: "What do critics warn regarding this trend?", options: ["Disruption of socio-economic frameworks", "Lack of innovation", "Loss of traditional cultures", "Decreased efficiency"], answer: "Disruption of socio-economic frameworks" },
            { q: "How is the impact on human resources described in the passage?", options: ["A paradigm shift", "Insignificant", "Purely destructive", "Entirely beneficial"], answer: "A paradigm shift" },
            { q: "What dichotomy is presented regarding environmental implications?", options: ["Optimized management vs. infrastructural demands", "High costs vs. low yields", "Public support vs. government opposition", "Clean energy vs. fossil fuels"], answer: "Optimized management vs. infrastructural demands" },
            { q: "What factor will largely determine the future trajectory of this field?", options: ["Regulatory policies and ethics", "Consumer demands", "Technological breakthroughs", "Financial markets"], answer: "Regulatory policies and ethics" }
          ]
        },
        writing: {
          prompt: `The rapid advancement of ${topic} is changing the world in unprecedented ways. Some people believe that it brings more drawbacks than benefits to society. To what extent do you agree or disagree with this statement?`
        },
        speaking: {
          questions: [
            `Let's discuss ${topic}. How has it influenced your daily routine or professional life?`,
            `What are the most significant challenges associated with ${topic} in your country?`,
            `Looking ahead, how do you foresee ${topic} evolving over the next 50 years?`
          ]
        }
      });
      setStep("written");
    }, 2000);
  };

  // --- LOGIC PHẦN WRITTEN ---
  const playListeningTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(examData?.listening?.script);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Đọc chậm lại một chút cho giống bài thi
      
      utterance.onstart = () => setIsPlayingTTS(true);
      utterance.onend = () => setIsPlayingTTS(false);
      utterance.onerror = () => setIsPlayingTTS(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ đọc văn bản.");
    }
  };

  const finishWrittenPhase = () => {
    window.speechSynthesis.cancel();
    setStep("speaking");
  };

  // --- LOGIC PHẦN SPEAKING ---
  const startRecording = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setRecordings((prev) => ({ ...prev, [index]: audioBlob }));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setRecordingIndex(index);
    } catch (err) {
      alert("Không thể truy cập Microphone. Vui lòng cấp quyền.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setRecordingIndex(null);
    }
  };

  // --- CHẤM ĐIỂM & NỘP BÀI ---
  const submitAll = () => {
    stopRecording();
    setIsEvaluating(true);
    
    setTimeout(() => {
      // 1. Chấm Listening
      const lTotal = examData.listening.questions.length;
      let lCorrect = 0;
      examData.listening.questions.forEach((q: any, i: number) => {
        if (answers.listening[i] === q.answer) lCorrect++;
      });
      const lScore = lCorrect === lTotal ? 9.0 : (lCorrect >= 3 ? 6.5 : (lCorrect > 0 ? 4.5 : 0.0));

      // 2. Chấm Reading
      const rTotal = examData.reading.questions.length;
      let rCorrect = 0;
      examData.reading.questions.forEach((q: any, i: number) => {
        if (answers.reading[i] === q.answer) rCorrect++;
      });
      const rScore = rCorrect === rTotal ? 9.0 : (rCorrect >= 3 ? 6.5 : (rCorrect > 0 ? 4.5 : 0.0));

      // 3. Chấm Writing (đếm chữ cơ bản)
      const wWords = answers.writing.trim().split(/\s+/).filter(w => w).length;
      const wScore = wWords >= 250 ? 7.0 : (wWords >= 150 ? 5.5 : (wWords > 50 ? 4.0 : 0.0));

      // 4. Chấm Speaking (Khắc phục lỗi mic trống/nói quá ít)
      let validRecordings = 0;
      Object.values(recordings).forEach((blob) => {
        // Blob size của webm thường > 20000 bytes (20KB) cho khoảng 2-3 giây nói có tiếng động.
        // Nếu file dưới mức này, chứng tỏ người dùng không nói gì hoặc chỉ bật/tắt mic lập tức.
        if (blob && blob.size > 25000) { 
          validRecordings++;
        }
      });

      const sTotal = examData.speaking.questions.length;
      let sScore = 0;
      if (validRecordings === sTotal) {
        sScore = 7.5;
      } else if (validRecordings >= 1) {
        sScore = 5.0;
      } else {
        sScore = 0.0; // Phát hiện mic rỗng hoặc im lặng
      }

      const overall = ((lScore + rScore + wScore + sScore) / 4).toFixed(1);
      
      const results = {
        listening: lScore,
        reading: rScore,
        writing: wScore,
        speaking: sScore,
        overall: Number(overall)
      };

      setFinalScores(results);
      setIsEvaluating(false);
      setStep("results");
      
      if (onTestComplete) {
        onTestComplete(results);
      }
    }, 2500);
  };

  // ================= RENDER UI (Giữ nguyên cấu trúc giao diện) =================

  if (step === "setup") {
    // ... (Giữ nguyên phần UI Setup)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6 rounded-[32px]">
          <h2 className="text-3xl font-black">Nhập chủ đề bài thi</h2>
          <Input 
            placeholder="VD: Artificial Intelligence, Climate Change..." 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-14 rounded-2xl text-center text-lg"
          />
          <Button onClick={handleGenerateExam} className="w-full h-14 rounded-2xl text-lg font-bold">
            TẠO ĐỀ THI
          </Button>
          {onCancel && <Button variant="ghost" onClick={onCancel} className="w-full">Quay lại</Button>}
        </Card>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
        <h2 className="text-2xl font-bold animate-pulse">AI đang thiết kế bài thi "{topic}"...</h2>
      </div>
    );
  }

  if (step === "written") {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="sticky top-4 z-50 flex flex-wrap gap-4 items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-mono font-bold text-xl">
              <Clock className="w-5 h-5 text-red-400 animate-pulse" />
              {formatTime(timeLeft)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-slate-500 font-bold">Mock Test Topic:</p>
              <p className="font-black text-indigo-600 truncate max-w-[200px]">{topic.toUpperCase()}</p>
            </div>
          </div>
          <Button onClick={finishWrittenPhase} className="bg-indigo-600 hover:bg-indigo-700 h-12 rounded-2xl font-bold px-8">
            NỘP BÀI & THI SPEAKING <Send className="w-4 h-4 ml-2"/>
          </Button>
        </div>

        <Tabs defaultValue="listening" className="w-full space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto h-14 bg-slate-100 rounded-[20px] p-1.5">
            <TabsTrigger value="listening" className="rounded-xl font-bold text-base">Listening</TabsTrigger>
            <TabsTrigger value="reading" className="rounded-xl font-bold text-base">Reading</TabsTrigger>
            <TabsTrigger value="writing" className="rounded-xl font-bold text-base">Writing</TabsTrigger>
          </TabsList>

          <TabsContent value="listening">
            <Card className="rounded-[32px] p-6 md:p-10 border-none shadow-sm bg-white">
              <div className="bg-purple-50 rounded-3xl p-8 flex flex-col items-center justify-center mb-8 border border-purple-100">
                <Button 
                  onClick={playListeningTTS} 
                  className={`w-20 h-20 rounded-full mb-4 ${isPlayingTTS ? 'bg-purple-400 animate-pulse' : 'bg-purple-600'}`}
                >
                  {isPlayingTTS ? <Square className="w-8 h-8 text-white fill-white" /> : <PlayCircle className="w-10 h-10 text-white" />}
                </Button>
                <p className="text-purple-700 font-bold">{isPlayingTTS ? "Đang phát âm thanh..." : "Bấm để nghe bài giảng"}</p>
              </div>
              
              <div className="space-y-8">
                {examData.listening.questions.map((q: any, i: number) => (
                  <div key={i} className="space-y-4">
                    <p className="text-lg font-bold text-slate-800">Câu {i+1}: {q.q}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = answers.listening[i] === opt;
                        return (
                          <Button 
                            key={optIdx}
                            variant="outline"
                            onClick={() => setAnswers(prev => ({...prev, listening: {...prev.listening, [i]: opt}}))}
                            className={`h-auto min-h-[60px] justify-start px-6 rounded-2xl whitespace-normal text-left font-semibold ${isSelected ? 'bg-purple-600 text-white border-purple-600' : 'text-slate-600'}`}
                          >
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 shrink-0 ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            {opt}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reading">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-[32px] p-8 border-none shadow-sm bg-white h-[700px] overflow-y-auto">
                <h3 className="font-black text-2xl mb-6 text-slate-900">Academic Reading Passage</h3>
                <p className="text-slate-700 leading-loose whitespace-pre-wrap text-[17px] font-medium">{examData.reading.passage}</p>
              </Card>
              <Card className="rounded-[32px] p-8 border-none shadow-sm bg-slate-50 h-[700px] overflow-y-auto space-y-8">
                {examData.reading.questions.map((q: any, i: number) => (
                  <div key={i} className="space-y-4 bg-white p-6 rounded-3xl border border-slate-100">
                    <p className="text-lg font-bold text-slate-800">Câu {i+1}: {q.q}</p>
                    <div className="flex flex-col gap-3">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = answers.reading[i] === opt;
                        return (
                          <Button 
                            key={optIdx}
                            variant="outline"
                            onClick={() => setAnswers(prev => ({...prev, reading: {...prev.reading, [i]: opt}}))}
                            className={`h-auto min-h-[50px] justify-start px-4 rounded-xl whitespace-normal text-left ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'text-slate-600'}`}
                          >
                            <span className="font-bold mr-3">{String.fromCharCode(65 + optIdx)}.</span>
                            {opt}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="writing">
            <Card className="rounded-[32px] p-8 border-none shadow-sm bg-white space-y-6">
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <p className="font-bold text-orange-800 text-lg uppercase mb-2">Writing Task 2</p>
                <p className="text-orange-950 text-xl font-medium italic">"{examData.writing.prompt}"</p>
                <p className="text-orange-700 text-sm mt-4 font-semibold">Write at least 250 words.</p>
              </div>
              <Textarea 
                placeholder="Type your academic essay here..."
                value={answers.writing}
                onChange={(e) => setAnswers(prev => ({...prev, writing: e.target.value}))}
                className="min-h-[400px] rounded-2xl p-6 text-lg bg-slate-50 border-slate-200 focus:ring-orange-500"
              />
              <p className="text-right text-slate-500 font-medium">
                Word count: {answers.writing.trim().split(/\s+/).filter(w => w).length}
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (step === "speaking") {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900 text-white p-10 rounded-[40px] text-center shadow-xl">
          <h2 className="text-4xl font-black mb-2">Phần thi Speaking</h2>
          <p className="text-slate-400 font-medium text-lg">Vui lòng đọc to và chi tiết câu trả lời của bạn vào microphone.</p>
        </div>

        <div className="space-y-6">
          {examData.speaking.questions.map((q: string, i: number) => {
            const isRecording = recordingIndex === i;
            const hasRecorded = !!recordings[i];

            return (
              <Card key={i} className={`rounded-[32px] p-8 border-2 transition-all ${isRecording ? 'border-red-500 shadow-lg' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">Part 3 - Question {i+1}</span>
                  {hasRecorded && <CheckCircle2 className="text-green-500 w-6 h-6" />}
                </div>
                <p className="text-2xl font-bold mb-8 text-slate-800">"{q}"</p>
                
                <Button 
                  onClick={() => isRecording ? stopRecording() : startRecording(i)}
                  disabled={recordingIndex !== null && recordingIndex !== i}
                  className={`h-14 px-8 rounded-full font-bold w-full md:w-auto ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'}`}
                >
                  {isRecording ? (
                    <><Square className="w-5 h-5 mr-2 fill-current" /> DỪNG GHI ÂM</>
                  ) : (
                    <><Mic className="w-5 h-5 mr-2" /> {hasRecorded ? "GHI ÂM LẠI" : "BẮT ĐẦU TRẢ LỜI"}</>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        <Button 
          onClick={submitAll} 
          disabled={isEvaluating}
          className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-xl font-black text-white shadow-xl shadow-indigo-200"
        >
          {isEvaluating ? <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> ĐANG PHÂN TÍCH ĐIỂM...</> : "HOÀN THÀNH & XEM ĐIỂM"}
        </Button>
      </div>
    );
  }

  if (step === "results") {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="text-center">
          <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl shadow-yellow-100 border-4 border-white">
            <Trophy className="w-12 h-12 text-yellow-900" />
          </div>
          <h2 className="text-5xl font-black text-slate-900 mb-2">Đã hoàn thành!</h2>
          <p className="text-slate-500 text-lg">Kết quả của bạn đã được cập nhật vào biểu đồ mạng nhện trên Dashboard.</p>
        </div>

        {finalScores.speaking === 0 && (
           <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-3 border border-red-200">
             <AlertCircle className="w-6 h-6 shrink-0" />
             <p className="font-medium">Hệ thống phát hiện ghi âm Speaking của bạn quá ngắn hoặc không có âm thanh. Bạn nhận 0 điểm cho phần này.</p>
           </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Listening', score: finalScores.listening, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Reading', score: finalScores.reading, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Writing', score: finalScores.writing, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Speaking', score: finalScores.speaking, color: 'text-pink-600', bg: 'bg-pink-50' },
          ].map((skill, idx) => (
            <Card key={idx} className={`rounded-[32px] border-none shadow-sm ${skill.bg} flex flex-col items-center justify-center p-8`}>
              <p className="text-slate-600 font-bold uppercase tracking-wider text-sm mb-2">{skill.label}</p>
              <p className={`text-5xl font-black ${skill.color}`}>{skill.score.toFixed(1)}</p>
            </Card>
          ))}
        </div>

        <Card className="rounded-[40px] bg-slate-900 text-white p-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left shadow-2xl shadow-slate-900/20">
          <div>
            <p className="text-slate-400 font-bold text-lg mb-2">Overall Band Score</p>
            <p className="text-sm text-slate-500 max-w-sm">Mức điểm này chỉ mang tính tham khảo dựa trên bài Mock Test AI.</p>
          </div>
          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 mt-6 md:mt-0">
            {finalScores.overall.toFixed(1)}
          </div>
        </Card>

        <div className="flex flex-col md:flex-row gap-4 pt-8">
          <Button onClick={() => window.location.reload()} className="flex-1 h-16 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-lg font-bold">
            <RotateCcw className="mr-2" /> LÀM ĐỀ KHÁC
          </Button>
          {onCancel && (
            <Button onClick={onCancel} className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold">
              <Home className="mr-2" /> VỀ DASHBOARD
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
}