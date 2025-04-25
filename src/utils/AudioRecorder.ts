
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private transcriptionInterval: NodeJS.Timeout | null = null;

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void
  ) {}

  async start() {
    try {
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
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start(10000); // Capture in 10-second chunks
      this.startTranscriptionInterval();

    } catch (error) {
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }

  private startTranscriptionInterval() {
    this.transcriptionInterval = setInterval(async () => {
      if (this.audioChunks.length > 0) {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        await this.transcribeAudio(audioBlob);
        this.audioChunks = []; // Clear the chunks after transcription
      }
    }, 10000);
  }

  private async transcribeAudio(audioBlob: Blob) {
    try {
      // Convert blob to base64
      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(buffer))
      );

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
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      if (data.text) {
        this.onTranscription(data.text);
      }

    } catch (error) {
      console.error('Transcription error:', error);
    }
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.transcriptionInterval) {
      clearInterval(this.transcriptionInterval);
      this.transcriptionInterval = null;
    }

    // Process any remaining audio
    if (this.audioChunks.length > 0) {
      const finalBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      this.transcribeAudio(finalBlob);
      this.audioChunks = [];
    }
  }
}
