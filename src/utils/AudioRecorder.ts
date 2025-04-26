
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private processingChunk = false;
  private chunkDuration = 30000; // 30 seconds per chunk

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void,
    private onMetricsUpdate?: (attention: number, understanding: number) => void
  ) {}

  async start() {
    try {
      console.log('Starting audio recording...');
      
      this.audioChunks = [];
      
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm'
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          // Process chunk immediately
          await this.processAudioChunk(event.data);
        }
        
        // Generate metrics feedback
        if (this.onMetricsUpdate) {
          const attention = Math.floor(70 + Math.random() * 30);
          const understanding = Math.floor(65 + Math.random() * 35);
          this.onMetricsUpdate(attention, understanding);
        }
      };

      // Record in 30-second chunks
      this.mediaRecorder.start(this.chunkDuration);
      console.log('Audio recording started in chunk mode');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
      this.cleanup();
    }
  }

  private async processAudioChunk(audioBlob: Blob) {
    if (this.processingChunk) {
      console.log('Already processing a chunk, skipping...');
      return;
    }

    this.processingChunk = true;
    console.log('Processing audio chunk of size:', audioBlob.size, 'bytes');

    try {
      if (audioBlob.size < 100) {
        console.warn('Audio chunk too small, skipping');
        return;
      }

      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      
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

      if (!response.ok) {
        throw new Error(`Transcription API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.text && data.text.trim().length > 0) {
        console.log('Received transcription for chunk:', data.text);
        this.onTranscription(data.text);
      }

    } catch (error) {
      console.error('Error processing audio chunk:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to process audio chunk'));
    } finally {
      this.processingChunk = false;
    }
  }

  async stop() {
    console.log('Stopping audio recording...');
    
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
        // Wait for any final chunks to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.onError(error instanceof Error ? error : new Error('Error stopping recording'));
    } finally {
      this.cleanup();
    }
  }

  private cleanup() {
    console.log('Cleaning up audio recorder resources');
    
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.id);
        track.stop();
      });
      this.stream = null;
    }

    this.audioChunks = [];
    this.processingChunk = false;
  }
}
