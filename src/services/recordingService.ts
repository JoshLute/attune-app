
import { BehaviorTag } from '@/types/BehaviorEvent';

interface TranscriptData {
  timestamp: string;
  text: string;
  confusion: number;
}

interface SummaryData {
  summary: string;
  missedContent: string;
  fullTranscript: string;
  usageStats: {
    whisperAudioSeconds: number;
    geminiTokens: number;
  };
  confusionData: Array<{
    timestamp: string;
    confusion: number;
  }>;
}

// Mock the Python functionality for demonstration purposes
class RecordingService {
  private isRecording: boolean = false;
  private transcripts: TranscriptData[] = [];
  private recordingInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private listeners: Array<(transcript: TranscriptData) => void> = [];
  private endSessionListeners: Array<(summary: SummaryData) => void> = [];

  // Simulate the Python confusion score calculation
  private getSimulatedConfusion(): number {
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    // Sine wave with period of 20 seconds, scaled to 0-1 range
    const confusion = (Math.sin(2 * Math.PI * elapsedTime / 20) + 1) / 2;
    return confusion;
  }

  // Start recording
  public startRecording(): void {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.startTime = Date.now();
    this.transcripts = [];
    
    // Simulate transcription at intervals
    this.recordingInterval = setInterval(() => {
      const transcriptTexts = [
        "Today we're going to learn about photosynthesis.",
        "The process requires sunlight, water, and carbon dioxide.",
        "The light reactions happen in the thylakoid membrane.",
        "ATP and NADPH are produced in this stage.",
        "Next, the Calvin cycle uses these products.",
        "Carbon fixation happens during this cycle.",
        "Let's review what we've learned about photosynthesis.",
        "Does anyone have any questions about the process?",
        "Remember this will be on the test next week.",
        "Make sure to review your notes before the exam."
      ];
      
      const randomIndex = Math.floor(Math.random() * transcriptTexts.length);
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const confusion = this.getSimulatedConfusion();
      
      const transcriptData = {
        timestamp,
        text: transcriptTexts[randomIndex],
        confusion
      };
      
      this.transcripts.push(transcriptData);
      
      // Notify listeners of new transcript
      this.listeners.forEach(listener => listener(transcriptData));
    }, 5000); // Generate a transcript every 5 seconds
  }

  // End recording session and generate summary
  public endRecording(): SummaryData {
    if (!this.isRecording) {
      return this.generateEmptySummary();
    }
    
    this.isRecording = false;
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    const summary = this.generateSummary();
    
    // Notify end session listeners
    this.endSessionListeners.forEach(listener => listener(summary));
    
    return summary;
  }

  // Generate empty summary
  private generateEmptySummary(): SummaryData {
    return {
      summary: "<p>No recording data available.</p>",
      missedContent: "<p>No recording data available.</p>",
      fullTranscript: "No transcripts recorded",
      usageStats: {
        whisperAudioSeconds: 0,
        geminiTokens: 0
      },
      confusionData: []
    };
  }

  // Generate summary from transcripts (mimicking Python code)
  private generateSummary(): SummaryData {
    const confusionData = this.transcripts.map(t => ({
      timestamp: t.timestamp,
      confusion: t.confusion
    }));
    
    // Simulate summary generation
    const summary = `
      <p>This lesson covered the process of photosynthesis in detail, focusing on both the light-dependent and light-independent reactions.</p>
      <ul>
        <li>Photosynthesis requires sunlight, water, and carbon dioxide</li>
        <li>Light reactions occur in the thylakoid membrane</li>
        <li>The Calvin cycle is responsible for carbon fixation</li>
        <li>ATP and NADPH are key products of the process</li>
      </ul>
      <blockquote>"Let's review what we've learned about photosynthesis."</blockquote>
    `;
    
    const missedContent = `
      <h3>Potentially Confusing Points</h3>
      <p>There were some segments where confusion was detected:</p>
      <ul>
        <li>The explanation of the thylakoid membrane structure (confusion score: 0.75)</li>
        <li>The details of ATP synthesis during light reactions (confusion score: 0.82)</li>
      </ul>
      <h3>Suggested Clarifications</h3>
      <ul>
        <li>Consider revisiting the role of ATP in the photosynthesis process</li>
        <li>Provide a visual diagram of the thylakoid membrane</li>
      </ul>
    `;
    
    const fullTranscript = this.transcripts.map(t => 
      `${t.timestamp}: ${t.text} (Confusion: ${t.confusion.toFixed(2)})`
    ).join('\n');
    
    return {
      summary,
      missedContent,
      fullTranscript,
      usageStats: {
        whisperAudioSeconds: this.transcripts.length * 5, // 5 seconds per transcript
        geminiTokens: Math.floor(Math.random() * 1000) + 500 // Random token count
      },
      confusionData
    };
  }

  // Add listener for transcript updates
  public addTranscriptListener(listener: (transcript: TranscriptData) => void): void {
    this.listeners.push(listener);
  }

  // Remove listener
  public removeTranscriptListener(listener: (transcript: TranscriptData) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Add end session listener
  public addEndSessionListener(listener: (summary: SummaryData) => void): void {
    this.endSessionListeners.push(listener);
  }

  // Remove end session listener
  public removeEndSessionListener(listener: (summary: SummaryData) => void): void {
    this.endSessionListeners = this.endSessionListeners.filter(l => l !== listener);
  }

  // Get all transcripts
  public getTranscripts(): TranscriptData[] {
    return [...this.transcripts];
  }

  // Check if recording is active
  public isActive(): boolean {
    return this.isRecording;
  }

  // Simulate adding behavior tag (mimicking Python's behavior tagging)
  public addBehaviorTag(studentName: string, tag: BehaviorTag): void {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[${timestamp}] Tagged ${studentName}: ${tag}`);
    // In a real implementation, this would update the backend
  }
}

// Create and export a singleton instance
export const recordingService = new RecordingService();
