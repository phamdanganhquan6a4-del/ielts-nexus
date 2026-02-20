"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Headset, PenTool, Mic, Calendar } from "lucide-react";

// Map icon tương ứng với từng kỹ năng
const skillIcons: any = {
  reading: <BookOpen className="w-4 h-4 text-blue-500" />,
  listening: <Headset className="w-4 h-4 text-green-500" />,
  writing: <PenTool className="w-4 h-4 text-orange-500" />,
  speaking: <Mic className="w-4 h-4 text-purple-500" />,
};

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setHistory(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lịch sử luyện tập</h2>
        <p className="text-muted-foreground">Xem lại lộ trình và kết quả các bài thi đã thực hiện.</p>
      </div>

      <Card className="shadow-md border-none bg-white/50 backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[150px]">Kỹ năng</TableHead>
                <TableHead>Chủ đề</TableHead>
                <TableHead className="w-[150px]">Ngày thực hiện</TableHead>
                <TableHead className="text-right w-[100px]">Điểm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                    Bạn chưa có bài luyện tập nào.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item: any) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="font-medium capitalize flex items-center gap-2">
                      {skillIcons[item.skill] || <PenTool className="w-4 h-4" />}
                      {item.skill}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate font-medium">
                      {item.topic}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={parseFloat(item.score) >= 7 ? "default" : "secondary"} className="text-sm font-bold">
                        {item.score}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}