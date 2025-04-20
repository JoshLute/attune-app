
import { aiService } from './aiService';

export const analyticsService = {
  async getClassInsights(classData: any) {
    try {
      const result = await aiService.generateInsights({
        type: "analytics",
        data: classData
      });
      
      return result.response || "No analytics insights available at this time.";
    } catch (error) {
      console.error("Error getting class insights:", error);
      return "Unable to generate analytics insights at this time.";
    }
  }
};
