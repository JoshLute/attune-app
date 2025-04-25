
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private transcriptionRetries: number = 0;
  private maxRetries: number = 3;

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void
  ) {}

  async start() {
    try {
      console.log('Starting audio recording with optimal settings...');
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000, // Required sample rate for OpenAI
          channelCount: 1,   // Mono audio
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm',
      });
      
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`Audio chunk captured: ${event.data.size} bytes`);
          await this.transcribeAudioChunk();
        }
      };

      this.mediaRecorder.start(5000); // Capture in 5-second chunks
      console.log('Audio recording started successfully with optimal settings');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }

  private async transcribeAudioChunk() {
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
        String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)))
      );

      console.log(`Sending audio chunk for transcription, size: ${base64Audio.length}`);
      
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
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.text && data.text.trim().length > 0) {
        console.log('Received transcription:', data.text);
        this.onTranscription(data.text);
        this.transcriptionRetries = 0; // Reset retries on success
      }

      // Clear processed chunks
      this.audioChunks = [];

    } catch (error) {
      console.error('Transcription error:', error);
      
      if (this.transcriptionRetries < this.maxRetries) {
        this.transcriptionRetries++;
        console.log(`Retrying transcription, attempt ${this.transcriptionRetries} of ${this.maxRetries}`);
        await this.transcribeAudioChunk();
      } else {
        this.onError(error instanceof Error ? error : new Error('Transcription failed'));
        this.audioChunks = []; // Clear chunks after max retries
        this.transcriptionRetries = 0;
      }
    }
  }

  stop() {
    console.log('Stopping audio recorder...');
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Process any remaining audio
    if (this.audioChunks.length > 0) {
      this.transcribeAudioChunk();
    }
  }
}
