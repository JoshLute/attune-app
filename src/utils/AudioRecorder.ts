
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private transcriptionInterval: NodeJS.Timeout | null = null;
  private isTranscribing: boolean = false;
  private transcriptionRetries: number = 0;
  private maxRetries: number = 3;

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void
  ) {}

  async start() {
    try {
      console.log('Starting audio recording...');
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`Audio chunk captured: ${event.data.size} bytes`);
        }
      };

      this.mediaRecorder.start(5000); // Capture in 5-second chunks for more frequent processing
      this.startTranscriptionInterval();
      console.log('Audio recording started successfully');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }

  private startTranscriptionInterval() {
    // Clear any existing interval
    if (this.transcriptionInterval) {
      clearInterval(this.transcriptionInterval);
    }
    
    this.transcriptionInterval = setInterval(() => {
      if (this.audioChunks.length > 0 && !this.isTranscribing) {
        this.transcribeCurrentChunks();
      }
    }, 5000); // Process more frequently
  }

  private async transcribeCurrentChunks() {
    if (this.isTranscribing || this.audioChunks.length === 0) return;
    
    try {
      this.isTranscribing = true;
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Make a copy of chunks before clearing to allow retries
      const currentChunks = [...this.audioChunks];
      this.audioChunks = []; // Clear the chunks before transcription to avoid duplicates
      
      const success = await this.transcribeAudio(audioBlob);
      
      // If transcription failed, add chunks back for retry
      if (!success && this.transcriptionRetries < this.maxRetries) {
        console.log(`Transcription failed, will retry. Attempt ${this.transcriptionRetries + 1} of ${this.maxRetries}`);
        this.audioChunks = [...currentChunks, ...this.audioChunks];
        this.transcriptionRetries++;
      } else {
        this.transcriptionRetries = 0; // Reset retries on success
      }
    } catch (error) {
      console.error('Transcription error in interval:', error);
    } finally {
      this.isTranscribing = false;
    }
  }

  private async transcribeAudio(audioBlob: Blob): Promise<boolean> {
    try {
      console.log(`Transcribing audio blob of size: ${audioBlob.size} bytes`);
      
      // Skip if blob is too small
      if (audioBlob.size < 500) {
        console.log('Audio blob too small, skipping transcription');
        return true; // Consider this a success to avoid retries for empty audio
      }

      // Convert blob to base64 with improved chunking
      const buffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Process in smaller chunks to avoid call stack size exceeded
      let binary = '';
      const chunkSize = 512; // Reduced chunk size
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
        // Use apply with a temporary array to avoid "Maximum call stack size exceeded"
        const tempArray = Array.from(chunk);
        binary += String.fromCharCode.apply(null, tempArray);
      }
      
      const base64Audio = btoa(binary);
      console.log(`Audio converted to base64, length: ${base64Audio.length}`);

      // Call Supabase Edge Function with proper authorization
      const response = await fetch(
        'https://objlnvvnifkotxctblgd.functions.supabase.co/transcribe-audio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audioData: base64Audio }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Transcription API error:', response.status, errorText);
        return false; // Failed transcription
      }

      const data = await response.json();
      console.log('Transcription response:', data);
      
      if (data.text && data.text.trim().length > 0) {
        console.log('Received transcription:', data.text);
        this.onTranscription(data.text);
        return true;
      } else if (data.error) {
        console.error('Transcription error from API:', data.error);
        return false;
      } else {
        console.log('No text returned from transcription API');
        return true; // Consider empty result as success (no speech detected)
      }

    } catch (error) {
      console.error('Transcription error:', error);
      return false;
    }
  }

  stop() {
    console.log('Stopping audio recorder...');
    
    if (this.transcriptionInterval) {
      clearInterval(this.transcriptionInterval);
      this.transcriptionInterval = null;
      console.log('Transcription interval cleared');
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      console.log('Media recorder stopped');
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      console.log('Audio tracks stopped');
    }

    // Process any remaining audio
    if (this.audioChunks.length > 0) {
      console.log(`Processing ${this.audioChunks.length} remaining audio chunks`);
      const finalBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = [];
      this.transcribeAudio(finalBlob);
    }
  }
}
