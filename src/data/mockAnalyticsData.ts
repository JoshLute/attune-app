
import { AnalyticsDataPoint, LessonSegment } from "@/types/analytics";

// Mock data for the analytics chart
export const analyticsDataToday: AnalyticsDataPoint[] = [
  { timestamp: '00:00', attention: 90, understanding: 95, transcript: "Today we're going to learn about photosynthesis." },
  { timestamp: '02:30', attention: 85, understanding: 80, transcript: "The process requires sunlight, water, and carbon dioxide." },
  { timestamp: '05:00', attention: 60, understanding: 40, transcript: "The light reactions happen in the thylakoid membrane." },
  { timestamp: '07:30', attention: 70, understanding: 30, transcript: "ATP and NADPH are produced in this stage." },
  { timestamp: '10:00', attention: 80, understanding: 60, transcript: "Next, the Calvin cycle uses these products." },
  { timestamp: '12:30', attention: 90, understanding: 85, transcript: "Carbon fixation happens during this cycle." },
  { timestamp: '15:00', attention: 95, understanding: 90, transcript: "Let's review what we've learned about photosynthesis." },
];

export const analyticsDataWeek: AnalyticsDataPoint[] = [
  { timestamp: 'Mon', attention: 85, understanding: 80, transcript: "Monday's photosynthesis lesson" },
  { timestamp: 'Tue', attention: 75, understanding: 70, transcript: "Tuesday's cellular respiration lesson" },
  { timestamp: 'Wed', attention: 90, understanding: 85, transcript: "Wednesday's genetics lesson" },
  { timestamp: 'Thu', attention: 65, understanding: 55, transcript: "Thursday's evolution lesson" },
  { timestamp: 'Fri', attention: 80, understanding: 75, transcript: "Friday's ecology lesson" },
];

export const analyticsDataMonth: AnalyticsDataPoint[] = [
  { timestamp: 'Week 1', attention: 80, understanding: 75, transcript: "First week of the month" },
  { timestamp: 'Week 2', attention: 85, understanding: 80, transcript: "Second week of the month" },
  { timestamp: 'Week 3', attention: 75, understanding: 70, transcript: "Third week of the month" },
  { timestamp: 'Week 4', attention: 90, understanding: 85, transcript: "Fourth week of the month" },
];

// Mock data for the lesson outline
export const lessonOutline: LessonSegment[] = [
  { 
    timestamp: '00:00 - 05:00', 
    topic: 'Introduction to Photosynthesis', 
    status: 'attentive',
    transcript: "Today we're going to learn about photosynthesis. The process requires sunlight, water, and carbon dioxide."
  },
  { 
    timestamp: '05:00 - 08:00', 
    topic: 'Light Reactions', 
    status: 'confused',
    transcript: "The light reactions happen in the thylakoid membrane. ATP and NADPH are produced in this stage."
  },
  { 
    timestamp: '08:00 - 13:00', 
    topic: 'Calvin Cycle', 
    status: 'inattentive',
    transcript: "Next, the Calvin cycle uses these products. Carbon fixation happens during this cycle."
  },
  { 
    timestamp: '13:00 - 15:00', 
    topic: 'Summary and Review', 
    status: 'attentive',
    transcript: "Let's review what we've learned about photosynthesis."
  },
];

// AI Suggestions for teaching
export const aiSuggestions = [
  "Take a break before starting practice problems",
  "Jonathan doesn't like to be called on unless he intentionally raises his hand. His attention decreased significantly"
];
