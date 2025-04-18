
export interface LiveLogEntry {
  time: string;
  confusion_level: number;
  attention_level: number;
  transcription_text: string | null;
}
