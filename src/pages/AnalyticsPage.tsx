
import React, { useState } from 'react';
import { AttuneSidebar } from '@/components/sidebar/AttuneSidebar';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAndDownloadReport } from '@/utils/reportGenerator';

// Import components
import AnalyticsChart from '@/components/analytics/AnalyticsChart';
import LessonOutlineSection from '@/components/analytics/LessonOutlineSection';
import UnderstandingSummary from '@/components/analytics/UnderstandingSummary';
import AISuggestionsSection from '@/components/analytics/AISuggestionsSection';

// Import mock data
import { 
  analyticsDataToday, 
  analyticsDataWeek, 
  analyticsDataMonth,
  lessonOutline,
  aiSuggestions
} from '@/data/mockAnalyticsData';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const { toast } = useToast();
  
  const getDataByTimeRange = () => {
    switch (timeRange) {
      case 'today':
        return analyticsDataToday;
      case 'week':
        return analyticsDataWeek;
      case 'month':
        return analyticsDataMonth;
      default:
        return analyticsDataToday;
    }
  };

  const handleDownloadReport = () => {
    // Generate and download the PDF report
    generateAndDownloadReport(
      getDataByTimeRange(),
      lessonOutline,
      "Lesson Summary Report"
    );
    
    toast({
      title: "Report Generated",
      description: "Your lesson summary report has been downloaded",
    });
  };
  
  return (
    <div className="flex h-screen bg-white">
      <AttuneSidebar />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics</h1>
              <p className="text-gray-500">Get insights from class sessions</p>
            </div>
            <Button 
              onClick={handleDownloadReport} 
              className="bg-[hsl(var(--attune-purple))] hover:bg-[hsl(var(--attune-dark-purple))]"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <AnalyticsChart 
              data={getDataByTimeRange()} 
              timeRange={timeRange}
              setTimeRange={setTimeRange}
            />
            
            <div className="space-y-6">
              <UnderstandingSummary lessonOutline={lessonOutline} />
              <LessonOutlineSection lessonOutline={lessonOutline} />
            </div>
          </div>
          
          <AISuggestionsSection suggestions={aiSuggestions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
