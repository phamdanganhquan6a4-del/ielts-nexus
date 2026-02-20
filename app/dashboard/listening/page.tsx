'use client';
import { useState } from 'react';
import { Loader2, Play, Pause, RefreshCw, Headphones, Eye, EyeOff } from 'lucide-react';

export default function ListeningPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // State riêng cho Listening
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false); // Mặc định ẩn bài đọc

  const toggleSpeech = () => {
    if (!testData?.passage) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(testData.passage);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const generateTest = async () => {
    if (!topic) return;
    setLoading(true);
    setSubmitted(false);
    setUserAnswers({});
    setShowTranscript(false); // Reset lại ẩn bài đọc
    setTestData(null);

    try {
      // Dùng chung API với Reading (Vì logic tạo nội dung giống nhau)
      const res = await fetch('/api/reading/generate', {
        method: 'POST',
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      
      if (data.error) {
        alert("Lỗi: " + data.error);
        return;
      }
      setTestData(data);
    } catch (error) {
      console.error(error);
      alert("Lỗi kết nối!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!testData?.questions) return;
    let currentScore = 0;
    testData.questions.forEach((q: any) => {
      if (userAnswers[q.id] === q.correctAnswer) currentScore++;
    });
    setScore(currentScore);
    setSubmitted(true);
    // Sau khi nộp bài thì tự động hiện transcript để đối chiếu
    setShowTranscript(true); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const bandScore = (currentScore / testData.questions.length) * 9.0;
    fetch('/api/save-result', {
      method: 'POST',
      body: JSON.stringify({
        skill: 'listening', // Nhớ đổi thành listening
        score: bandScore,
        topic: topic
      })
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      
      {/* Header */}
      <div className="bg-white p-4 border-b shadow-sm flex items-center gap-4">
        <div className="flex items-center gap-2 text-purple-600 font-bold mr-4">
            <Headphones size={24}/> <span>LISTENING MODE</span>
        </div>
        <input 
          type="text" 
          placeholder="Enter topic..." 
          className="border p-2 rounded-lg w-64 focus:ring-2 ring-purple-500 outline-none"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateTest()}
        />
        <button 
          onClick={generateTest}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
          {loading ? "Generating..." : "Create Listening Test"}
        </button>
      </div>

      {testData && (
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          
          {/* CỘT TRÁI: AUDIO PLAYER + TRANSCRIPT (Ẩn/Hiện) */}
          <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r bg-white flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{testData.title}</h1>
            
            {/* Bộ điều khiển Audio */}
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex flex-col items-center justify-center gap-4 mb-8 shadow-sm">
                <div className="text-purple-800 font-semibold">Audio Player</div>
                <button 
                    onClick={toggleSpeech}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${isSpeaking ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'}`}
                >
                    {isSpeaking ? <Pause size={32}/> : <Play size={32} className="ml-1"/>}
                </button>
                <p className="text-sm text-gray-500">{isSpeaking ? "Playing..." : "Click to listen"}</p>
            </div>

            {/* Nút Ẩn/Hiện Transcript */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700">Transcript</h3>
                <button 
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                >
                    {showTranscript ? <EyeOff size={16}/> : <Eye size={16}/>}
                    {showTranscript ? "Hide Text" : "Show Text"}
                </button>
            </div>

            {/* Nội dung bài đọc (Mờ đi nếu đang ẩn) */}
            <div className={`prose text-gray-700 leading-relaxed text-lg transition-all duration-300 ${showTranscript ? 'opacity-100' : 'opacity-0 blur-sm select-none h-32 overflow-hidden'}`}>
              {testData.passage}
            </div>
            {!showTranscript && <p className="text-center text-gray-400 italic mt-2">Transcript is hidden. Listen to answer.</p>}
          </div>

          {/* CỘT PHẢI: CÂU HỎI */}
          <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-gray-50">
            <div className="max-w-xl mx-auto pb-20">
              
              {submitted && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <p className="font-bold text-xl">Score: {score} / {testData.questions?.length || 0}</p>
                </div>
              )}

              <div className="space-y-8">
                {testData.questions?.map((q: any, index: number) => (
                  <div key={q.id || index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-3">
                      <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-sm mr-2">Q{index + 1}</span>
                      {q.text}
                    </p>
                    <div className="space-y-2">
                      {q.options?.map((option: string) => (
                        <button
                          key={option}
                          disabled={submitted}
                          onClick={() => setUserAnswers(prev => ({...prev, [q.id]: option}))}
                          className={`w-full text-left px-4 py-3 rounded-md border transition-all ${
                            submitted 
                              ? option === q.correctAnswer 
                                ? "bg-green-100 border-green-500" 
                                : userAnswers[q.id] === option ? "bg-red-100 border-red-500" : "opacity-50"
                              : userAnswers[q.id] === option ? "bg-purple-50 border-purple-500" : "hover:bg-gray-50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!submitted && (
                <button onClick={handleSubmit} className="mt-8 w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-700">
                  Submit Answers
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}