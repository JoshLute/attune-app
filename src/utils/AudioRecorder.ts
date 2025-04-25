
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private transcriptionInterval: NodeJS.Timeout | null = null;
  private isTranscribing: boolean = false;

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

      this.mediaRecorder.start(10000); // Capture in 10-second chunks
      this.startTranscriptionInterval();
      console.log('Audio recording started successfully');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }

  private startTranscriptionInterval() {
    this.transcriptionInterval = setInterval(() => {
      if (this.audioChunks.length > 0 && !this.isTranscribing) {
        this.transcribeCurrentChunks();
      }
    }, 10000);
  }

  private async transcribeCurrentChunks() {
    if (this.isTranscribing || this.audioChunks.length === 0) return;
    
    try {
      this.isTranscribing = true;
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.audioChunks = []; // Clear the chunks before transcription to avoid duplicates
      
      await this.transcribeAudio(audioBlob);
    } catch (error) {
      console.error('Transcription error in interval:', error);
    } finally {
      this.isTranscribing = false;
    }
  }

  private async transcribeAudio(audioBlob: Blob) {
    try {
      console.log(`Transcribing audio blob of size: ${audioBlob.size} bytes`);
      
      // Skip if blob is too small
      if (audioBlob.size < 1000) {
        console.log('Audio blob too small, skipping transcription');
        return;
      }

      // Convert blob to base64
      const buffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Process in chunks to avoid call stack size exceeded
      let binary = '';
      const chunkSize = 1024;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binary);
      console.log(`Audio converted to base64, length: ${base64Audio.length}`);

      // Call Supabase Edge Function
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
        console.error('Transcription API error:', errorText);
        throw new Error(`Transcription failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Transcription response:', data);
      
      if (data.text) {
        console.log('Received transcription:', data.text);
        this.onTranscription(data.text);
      } else if (data.error) {
        console.error('Transcription error from API:', data.error);
      }

    } catch (error) {
      console.error('Transcription error:', error);
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
