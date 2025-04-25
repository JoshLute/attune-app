
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void
  ) {}

  async start() {
    try {
      console.log('Starting audio recording...');
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
      
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          console.log(`Audio chunk captured: ${event.data.size} bytes`);
          await this.transcribeAudio(event.data);
        }
      };

      // Record in shorter 5-second chunks for more responsive transcription
      this.mediaRecorder.start(5000);
      console.log('Audio recording started with 5-second intervals');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }

  private async transcribeAudio(audioBlob: Blob) {
    try {
      // Skip if blob is too small (likely no speech)
      if (audioBlob.size < 1000) {
        console.log('Audio chunk too small, skipping transcription');
        return;
      }

      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(buffer))
      );

      console.log('Sending audio chunk for transcription');
      
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
      }

    } catch (error) {
      console.error('Transcription error:', error);
      // Just log the error and continue - don't retry
      this.onError(error instanceof Error ? error : new Error('Transcription failed'));
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
  }
}
