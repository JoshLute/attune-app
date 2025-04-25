
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries = 3;
  private retryDelay = 2000;
  private transcriptionInterval: NodeJS.Timeout | null = null;

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void
  ) {}

  async start() {
    try {
      console.log('Starting audio recording with synchronized 10-second intervals...');
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });
      
      // Set up 10-second chunks for transcription
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`Audio chunk captured: ${event.data.size} bytes at ${new Date().toISOString()}`);
          await this.transcribeAudioWithRetry(0);
        }
      };

      // Start recording in 10-second chunks
      this.mediaRecorder.start(10000);
      console.log('Audio recording started with 10-second chunk intervals');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }

  private async transcribeAudioWithRetry(retryCount: number) {
    if (this.audioChunks.length === 0) return;

    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Skip if blob is too small (likely no speech)
      if (audioBlob.size < 1000) {
        console.log('Audio chunk too small, skipping transcription');
        this.audioChunks = [];
        return;
      }

      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(buffer))
      );

      console.log(`Sending audio chunk for transcription, attempt ${retryCount + 1} of ${this.maxRetries + 1}`);
      
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

      console.log(`Transcription response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Transcription error response: ${errorData}`);
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Transcription response data:`, data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.text && data.text.trim().length > 0) {
        console.log('Received transcription:', data.text);
        this.onTranscription(data.text);
      } else {
        console.log('No transcription text received');
      }

      // Clear processed chunks on success
      this.audioChunks = [];

    } catch (error) {
      console.error('Transcription error:', error);
      
      if (retryCount < this.maxRetries) {
        console.log(`Retrying transcription in ${this.retryDelay}ms...`);
        
        // Clear any existing retry timeout
        if (this.retryTimeout) {
          clearTimeout(this.retryTimeout);
        }
        
        // Schedule retry with delay
        this.retryTimeout = setTimeout(() => {
          this.transcribeAudioWithRetry(retryCount + 1);
        }, this.retryDelay);
      } else {
        console.error(`Failed after ${this.maxRetries + 1} attempts, notifying user`);
        this.onError(error instanceof Error ? error : new Error('Transcription failed'));
        this.audioChunks = []; // Clear chunks after max retries
      }
    }
  }

  stop() {
    console.log('Stopping audio recorder...');
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Process any remaining audio
    if (this.audioChunks.length > 0) {
      this.transcribeAudioWithRetry(0);
    }
  }
}
