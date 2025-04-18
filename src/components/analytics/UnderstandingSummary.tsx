
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, AlertTriangle, Activity } from 'lucide-react';

interface UnderstandingSummaryProps {
  summaryData: any;
}

export const UnderstandingSummary = ({ summaryData }: UnderstandingSummaryProps) => {
  const lessonOutline = [
    { status: 'attentive' },
    { status: 'confused' },
    { status: 'inattentive' },
    { status: 'attentive' }
  ];

  const totalSegments = lessonOutline.length;
  const attentiveSegments = lessonOutline.filter(segment => segment.status === 'attentive').length;
  const understandingPercentage = Math.round((attentiveSegments / totalSegments) * 100);

  return (
    <Card className="rounded-2xl overflow-hidden shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)] border border-purple-100">
      <CardHeader className="bg-[hsl(var(--attune-light-purple))] text-white pb-3">
        <CardTitle className="text-xl">Summary</CardTitle>
        <CardDescription className="text-white text-opacity-80">4 Minutes 22 Seconds</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg text-gray-600">Understanding</span>
          <span className="text-2xl font-bold text-[hsl(var(--attune-purple))]">{understandingPercentage}%</span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute top-0 left-0 h-full bg-green-500" 
            style={{ width: `${understandingPercentage}%` }}
          ></div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Time</TableHead>
              <TableHead className="text-right">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="flex items-center gap-1">
                <Eye size={14} className="text-green-600" /> Attentive
              </TableCell>
              <TableCell className="text-right">7m 00s</TableCell>
              <TableCell className="text-right">47%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="flex items-center gap-1">
                <AlertTriangle size={14} className="text-red-600" /> Confused
              </TableCell>
              <TableCell className="text-right">3m 00s</TableCell>
              <TableCell className="text-right">20%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="flex items-center gap-1">
                <Activity size={14} className="text-yellow-600" /> Inattentive
              </TableCell>
              <TableCell className="text-right">5m 00s</TableCell>
              <TableCell className="text-right">33%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
