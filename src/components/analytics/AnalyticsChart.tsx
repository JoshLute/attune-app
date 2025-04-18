
import React from 'react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface AnalyticsChartProps {
  timeRange: 'today' | 'week' | 'month';
  setTimeRange: (range: 'today' | 'week' | 'month') => void;
  data: any[];
}

export const AnalyticsChart = ({ timeRange, setTimeRange, data }: AnalyticsChartProps) => {
  const chartConfig = {
    attention: { theme: { light: "#9FE2BF", dark: "#3CB371" } },
    understanding: { theme: { light: "#ADD8E6", dark: "#1E90FF" } }
  };

  return (
    <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center justify-end mb-4">
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
      <div className="h-[300px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full [&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area type="monotone" dataKey="attention" name="Attention" stroke="#3CB371" fill="#9FE2BF" fillOpacity={0.3} />
              <Area type="monotone" dataKey="understanding" name="Understanding" stroke="#1E90FF" fill="#ADD8E6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};
