
import { aiService } from './aiService';

export const studentService = {
  async getStudentSuggestions(studentId: string, studentData: any) {
    try {
      const result = await aiService.generateInsights({
        type: "student",
        data: studentData
      });
      
      return Array.isArray(result.response) 
        ? result.response 
        : typeof result.response === 'string'
          ? [result.response]
          : ["No suggestions available at this time."];
    } catch (error) {
      console.error("Error getting student suggestions:", error);
      return ["Unable to generate suggestions at this time."];
    }
  }
};
