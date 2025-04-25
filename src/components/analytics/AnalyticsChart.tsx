
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface AnalyticsData {
  timestamp: string;
  attention: number;
  understanding: number;
  transcript: string;
}

interface Tag {
  id: string;
  tag_text: string;
  timestamp: string;
}

interface AnalyticsChartProps {
  sessionTitle: string;
  analyticsData: AnalyticsData[];
  sessionTags?: Tag[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  sessionTitle,
  analyticsData,
  sessionTags = []
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  
  // Prepare data with tags
  const chartData = analyticsData.map(data => ({
    ...data,
    tag: sessionTags.find(tag => {
      const tagTime = new Date(tag.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return tagTime === data.timestamp;
    })?.tag_text
  }));

  return (
    <div className="rounded-3xl p-6 bg-gray-50 shadow-[5px_5px_15px_rgba(0,0,0,0.05),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BookOpen className="mr-2 text-[hsl(var(--attune-purple))]" />
          <h2 className="text-xl font-semibold text-[hsl(var(--attune-purple))]">{sessionTitle}</h2>
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
          config={{
            attention: { theme: { light: "#9FE2BF", dark: "#3CB371" } },
            understanding: { theme: { light: "#ADD8E6", dark: "#1E90FF" } }
          }}
          className="h-full w-full [&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis tickFormatter={(value) => `${Math.round(value)}%`} />
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border rounded shadow">
                        <p className="text-sm">{payload[0].payload.timestamp}</p>
                        {payload.map((p: any, i: number) => (
                          <p key={i} className="text-sm">
                            {p.name}: {Math.round(p.value)}%
                          </p>
                        ))}
                        {payload[0].payload.tag && (
                          <p className="text-sm font-bold mt-1">
                            Tag: {payload[0].payload.tag}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Areas for metrics */}
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
              
              {/* Reference lines for tags */}
              {sessionTags.map((tag) => {
                const tagTime = new Date(tag.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                return (
                  <ReferenceLine
                    key={tag.id}
                    x={tagTime}
                    stroke="#FF6B6B"
                    strokeDasharray="3 3"
                    label={{ 
                      value: tag.tag_text,
                      position: 'top',
                      fill: '#FF6B6B',
                      fontSize: 12
                    }}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};
