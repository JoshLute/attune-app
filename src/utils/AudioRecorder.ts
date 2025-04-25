
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isTranscribing = false;
  private transcriptionFailCount = 0;
  private readonly MAX_RETRIES = 3;

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void
  ) {}

  async start() {
    try {
      console.log('Starting audio recording...');
      
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up audio context for level monitoring
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
      
      // Configure recorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm'
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          console.log(`Audio chunk captured: ${event.data.size} bytes`);
          
          // Check if we're already processing a transcription
          if (this.isTranscribing) {
            console.log('Already transcribing, skipping this chunk');
            return;
          }
          
          await this.transcribeAudio(event.data);
        }
      };

      // Record in shorter 3-second chunks for more responsive transcription
      this.mediaRecorder.start(3000);
      console.log('Audio recording started with 3-second intervals');

      // Reset error counter on successful start
      this.transcriptionFailCount = 0;

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
      this.cleanup();
    }
  }

  private async transcribeAudio(audioBlob: Blob) {
    try {
      // Skip if blob is too small (likely no speech)
      if (audioBlob.size < 1000) {
        console.log('Audio chunk too small, skipping transcription');
        return;
      }

      // Set flag to indicate transcription in progress
      this.isTranscribing = true;

      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));

      console.log('Sending audio chunk for transcription');
      
      const response = await fetch(
        'https://objlnvvnifkotxctblgd.functions.supabase.co/transcribe-audio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxudnZuaWZrb3R4Y3RibGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MzcyNzgsImV4cCI6MjA2MDUxMzI3OH0.9qwOU2_CPeI-DFxyW21hcMz8wljuyg5Mju6dYyKySc0`
          },
          body: JSON.stringify({ audioData: base64Audio }),
        }
      );

      // Handle response status
      if (!response.ok) {
        let errorMessage = `Transcription failed: ${response.status}`;
        
        // Try to extract detailed error message if available
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
            
            // Handle specific error cases
            if (errorMessage.includes("quota") || errorMessage.includes("insufficient_quota")) {
              throw new Error("OpenAI API quota exceeded. Using local speech processing instead.");
            }
            
            if (response.status === 401) {
              throw new Error("Authentication failed. Please check your API credentials.");
            }
          }
        } catch (parseError) {
          // Fallback if we can't parse the error response
          console.error('Error parsing API error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.text && data.text.trim().length > 0) {
        console.log('Received transcription:', data.text);
        this.onTranscription(data.text);
        this.transcriptionFailCount = 0; // Reset counter on success
      }

    } catch (error) {
      console.error('Transcription error:', error);
      this.transcriptionFailCount++;
      
      // If it's a quota error, provide a special message
      if (error.message.includes("quota") || error.message.includes("OpenAI API quota")) {
        // Create a simulated transcription based on audio level
        this.provideFallbackTranscription();
      } 
      // Only report errors to the user after multiple consecutive failures
      else if (this.transcriptionFailCount >= this.MAX_RETRIES) {
        this.onError(error instanceof Error ? error : new Error('Transcription failed repeatedly'));
      }
    } finally {
      // Reset flag when transcription is complete (success or failure)
      this.isTranscribing = false;
    }
  }

  // Provide a fallback when transcription service fails
  private provideFallbackTranscription() {
    // Use audio level to detect if there's likely speech
    const level = this.getAudioLevel();
    if (level > 30) {
      console.log('Using fallback transcription due to API limits');
      this.onTranscription("Speech detected, but transcription service unavailable (API quota exceeded).");
    }
  }

  getAudioLevel(): number {
    if (!this.analyser) return 0;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    return Math.min(100, (average / 128) * 100);
  }

  private cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
    }
  }

  stop() {
    console.log('Stopping audio recorder...');
    this.cleanup();
  }
}
