'use client';
// Nhớ chạy: npm install recharts trước đó nhé
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { useEffect, useState } from 'react';

export default function IELTSChart() {
  const [data, setData] = useState([
    { subject: 'Reading', A: 0, fullMark: 9 },
    { subject: 'Listening', A: 0, fullMark: 9 },
    { subject: 'Writing', A: 0, fullMark: 9 },
    { subject: 'Speaking', A: 0, fullMark: 9 },
  ]);

  useEffect(() => {
    // Gọi API lấy điểm trung bình mà chúng ta vừa viết ở bước trước
    fetch('/api/stats')
      .then(res => res.json())
      .then(stats => {
        const chartMapped = [
          { subject: 'Reading', A: Number(stats.READING) || 0, fullMark: 9 },
          { subject: 'Listening', A: Number(stats.LISTENING) || 0, fullMark: 9 },
          { subject: 'Writing', A: Number(stats.WRITING) || 0, fullMark: 9 },
          { subject: 'Speaking', A: Number(stats.SPEAKING) || 0, fullMark: 9 },
        ];
        setData(chartMapped);
      })
      .catch(err => console.error("Lỗi fetch stats:", err));
  }, []);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full h-[400px]">
      <h2 className="text-center font-bold text-gray-700 mb-2">Phân tích kỹ năng IELTS</h2>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a5568', fontSize: 14 }} />
          <PolarRadiusAxis angle={30} domain={[0, 9]} tick={false} axisLine={false} />
          <Radar
            name="Band Score"
            dataKey="A"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}