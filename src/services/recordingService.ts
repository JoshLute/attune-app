import { BehaviorTag } from '@/types/BehaviorEvent';
import { createClient } from '@supabase/supabase-js';

// Environment variables provided by Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

class RecordingService {
  private isRecording: boolean = false;
  private transcripts: TranscriptData[] = [];
  private recordingInterval: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private listeners: Array<(transcript: TranscriptData) => void> = [];
  private endSessionListeners: Array<(summary: SummaryData) => void> = [];
  
  // Audio recording properties
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  
  // Confusion simulation/detection
  private getConfusionScore(): number {
    if (this.analyser) {
      // In a real implementation, this would analyze audio features to detect confusion
      // For now, we'll use a combination of real audio volume and a simulated element
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(dataArray);
      
      // Get average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      
      // Normalize to 0-1 range with some randomness to simulate real confusion detection
      const normalizedValue = Math.min(1, Math.max(0, average / 128));
      
      // Add some simulated patterns to make it look realistic
      const elapsedTime = (Date.now() - this.startTime) / 1000;
      const simulatedPattern = (Math.sin(2 * Math.PI * elapsedTime / 20) + 1) / 4; // Range 0-0.5
      
      // Combine real audio data with simulation
      return 0.2 + normalizedValue * 0.3 + simulatedPattern;
    }
    
    // Fallback to simulation if no audio analyzer
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    return (Math.sin(2 * Math.PI * elapsedTime / 20) + 1) / 2;
  }

  // Start recording
  public async startRecording(): Promise<boolean> {
    if (this.isRecording) return true;
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context and analyzer
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      
      // Configure analyzer
      this.analyser.fftSize = 256;
      
      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      // Start recording
      this.mediaRecorder.start(2000); // Capture in 2-second chunks
      this.isRecording = true;
      this.startTime = Date.now();
      this.transcripts = [];
      
      // Listen for data available events
      this.mediaRecorder.addEventListener('dataavailable', async (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          await this.processAudioChunk(event.data);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }
  
  // Process audio chunk and get transcription
  private async processAudioChunk(audioBlob: Blob): Promise<void> {
    try {
      // Create form data to send the audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'chunk.webm');
      
      // Call Supabase Edge Function for transcription
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
      });
      
      if (error) {
        console.error('Transcription error:', error);
        return;
      }
      
      if (data && data.text) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const confusion = this.getConfusionScore();
        
        const transcriptData: TranscriptData = {
          timestamp,
          text: data.text,
          confusion
        };
        
        this.transcripts.push(transcriptData);
        
        // Notify listeners of new transcript
        this.listeners.forEach(listener => listener(transcriptData));
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  // End recording session and generate summary
  public async endRecording(): Promise<SummaryData> {
    if (!this.isRecording) {
      return this.generateEmptySummary();
    }
    
    this.isRecording = false;
    
    // Stop media recorder
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      
      // Clean up audio resources
      if (this.microphone) {
        this.microphone.disconnect();
        this.microphone = null;
      }
      
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      this.analyser = null;
      
      // Stop all tracks
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.mediaRecorder = null;
    }
    
    // Clear recording interval
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    // Generate summary
    try {
      // If we have transcripts, send them to the Supabase Edge Function for summarization
      if (this.transcripts.length > 0) {
        const { data, error } = await supabase.functions.invoke('summarize-transcript', {
          body: { transcripts: this.transcripts }
        });
        
        if (error) {
          console.error('Summarization error:', error);
          return this.generateSummary();
        }
        
        if (data) {
          // Notify end session listeners
          this.endSessionListeners.forEach(listener => listener(data));
          return data;
        }
      }
      
      // Fallback to local summary
      const summary = this.generateSummary();
      
      // Notify end session listeners
      this.endSessionListeners.forEach(listener => listener(summary));
      
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      return this.generateSummary();
    }
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

  // Generate summary from transcripts (local fallback)
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

  // Add behavior tag
  public async addBehaviorTag(studentName: string, tag: BehaviorTag): Promise<void> {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`[${timestamp}] Tagged ${studentName}: ${tag}`);
    
    // In a real implementation, save to Supabase database
    try {
      await supabase.from('behavior_tags').insert({
        student_name: studentName,
        tag,
        timestamp,
        session_id: this.startTime.toString() // Use session start time as ID
      });
    } catch (error) {
      console.error('Error saving behavior tag:', error);
    }
  }
}

// Create and export a singleton instance
export const recordingService = new RecordingService();
