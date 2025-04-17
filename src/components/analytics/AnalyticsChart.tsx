
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AnalyticsDataPoint } from '@/types/analytics';

interface AnalyticsChartProps {
  data: AnalyticsDataPoint[];
  timeRange: 'today' | 'week' | 'month';
  setTimeRange: (timeRange: 'today' | 'week' | 'month') => void;
}

const AnalyticsChart = ({ data, timeRange, setTimeRange }: AnalyticsChartProps) => {
  const chartConfig = {
    attention: { theme: { light: "#9FE2BF", dark: "#3CB371" } },
    understanding: { theme: { light: "#ADD8E6", dark: "#1E90FF" } }
  };

  return (
    <div className="lg:col-span-2 rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
          <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">Lesson Title</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden shadow-[2px_2px_5px_rgba(0,0,0,0.08)]">
            <Button
              variant={timeRange === 'today' ? 'default' : 'outline'}
              className={`rounded-r-none border-r-0 ${timeRange === 'today' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
              size="sm"
              onClick={() => setTimeRange('today')}
            >
              Today
            </Button>
            <Button
              variant={timeRange === 'week' ? 'default' : 'outline'}
              className={`rounded-none border-x-0 ${timeRange === 'week' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              This Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'default' : 'outline'}
              className={`rounded-l-none border-l-0 ${timeRange === 'month' ? 'bg-[hsl(var(--attune-purple))]' : ''}`}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              This Month
            </Button>
          </div>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full [&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="attention"
                name="Attention"
                stroke="#3CB371"
                fill="#9FE2BF"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="understanding"
                name="Understanding"
                stroke="#1E90FF"
                fill="#ADD8E6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
        <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3 shadow-inner bg-white">
          {data.map((item, index) => (
            <div key={index} className="mb-2">
              <span className="text-sm">{item.transcript}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
