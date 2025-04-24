import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { supabase } from '@/integrations/supabase/client';

interface LogEntry {
  time: string;
  transcription: string;
  confusion: number;
  inattention: number | null;
  attention: number;
  understanding: number;
}

const AnalyticsPage = () => {
  const [liveLogData, setLiveLogData] = useState<LogEntry[]>([]);
  const [averageAttention, setAverageAttention] = useState(0);
  const [averageUnderstanding, setAverageUnderstanding] = useState(0);

  useEffect(() => {
    const fetchLiveLogData = async () => {
      try {
        const { data, error } = await supabase
          .from('live log')
          .select('*')
          .order('time', { ascending: false });

        if (error) {
          console.error('Error fetching live log data:', error);
        }

        if (data) {
          // Map 'confusion' to both 'attention' and 'understanding'
          const mappedData = data.map(item => ({
            ...item,
            attention: item.confusion, // Assuming 'confusion' maps to 'attention'
            understanding: item.confusion, // Assuming 'confusion' maps to 'understanding'
          }));
          setLiveLogData(mappedData);
        }
      } catch (error) {
        console.error('Error fetching live log data:', error);
      }
    };

    fetchLiveLogData();
  }, []);

  useEffect(() => {
    // Recalculate averages whenever liveLogData changes
    setAverageAttention(calculateAverageAttention(liveLogData));
    setAverageUnderstanding(calculateAverageUnderstanding(liveLogData));
  }, [liveLogData]);

  const calculateAverageAttention = (data) => {
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((acc, current) => {
      return acc + current.attention;
    }, 0);
    
    return sum / data.length;
  };

  const calculateAverageUnderstanding = (data) => {
    if (!data || data.length === 0) return 0;
    
    const sum = data.reduce((acc, current) => {
      return acc + current.understanding;
    }, 0);
    
    return sum / data.length;
  };

  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-[hsl(var(--attune-purple))] mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Real-time insights into student engagement and understanding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attention Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Attention Levels</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={liveLogData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="attention" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-center mt-2">
                Average Attention: {averageAttention.toFixed(2)}
              </p>
            </div>

            {/* Understanding Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Understanding Levels</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={liveLogData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="understanding" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-center mt-2">
                Average Understanding: {averageUnderstanding.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Live Log Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Live Log</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transcription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attention
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Understanding
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {liveLogData.map((log) => (
                    <tr key={log.time}>
                      <td className="px-6 py-4 whitespace-nowrap">{log.time}</td>
                      <td className="px-6 py-4">{log.transcription}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{log.attention}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{log.understanding}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
