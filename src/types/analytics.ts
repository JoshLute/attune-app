
export type AnalyticsDataPoint = {
  timestamp: string;
  attention: number;
  understanding: number;
  transcript: string;
};

export type LessonSegment = {
  timestamp: string;
  topic: string;
  status: string;
  transcript: string;
};
