'use client';
import { useState } from 'react';
import { Loader2, RefreshCw, AlertTriangle, BookOpen } from 'lucide-react';

export default function ReadingPage() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const generateTest = async () => {
    if (!topic) return;
    setLoading(true);
    setSubmitted(false);
    setUserAnswers({});
    setTestData(null);

    try {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const bandScore = (currentScore / testData.questions.length) * 9.0;
    fetch('/api/save-result', {
      method: 'POST',
      body: JSON.stringify({
        skill: 'reading',
        score: bandScore,
        topic: topic
      })
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b shadow-sm flex items-center gap-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold mr-4">
            <BookOpen size={24}/> <span>READING MODE</span>
        </div>
        <input 
          type="text" 
          placeholder="Enter topic (e.g. History, Science)..." 
          className="border p-2 rounded-lg w-64 focus:ring-2 ring-blue-500 outline-none"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateTest()}
        />
        <button 
          onClick={generateTest}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
          {loading ? "Generating..." : "Create Reading Test"}
        </button>
      </div>

      {testData && (
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {/* CỘT TRÁI: BÀI ĐỌC (Luôn hiển thị) */}
          <div className="w-full md:w-1/2 p-8 overflow-y-auto border-r bg-white">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{testData.title}</h1>
            <div className="prose text-gray-700 leading-relaxed text-lg whitespace-pre-line">
              {testData.passage}
            </div>
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
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm mr-2">Q{index + 1}</span>
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
                              : userAnswers[q.id] === option ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
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
                <button onClick={handleSubmit} className="mt-8 w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700">
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