# live_transcriber.py
import queue
import threading
import time
import collections
import speech_recognition as sr

class LiveTranscriber:
    def __init__(self, buffer_duration=10):
        self.recognizer = sr.Recognizer()
        self.buffer_duration = buffer_duration  # seconds
        self.transcription_queue = collections.deque(maxlen=buffer_duration)
        self.audio_thread = None
        self.running = False

    def _listen_and_transcribe(self):
        mic = sr.Microphone(device_index=0)
        # mic.__enter__()
        # print(mic.name)
        # return
        with mic as source:
            print(source.stream)
            while self.running:
                try:
                    print("[Transcriber] Listening...")
                    audio = self.recognizer.listen(source, phrase_time_limit=2)
                    # text = self.recognizer.recognize_faster_whisper(audio)
                    text = self.recognizer.recognize_google(audio)
                    print(f"[Transcriber] Heard: {text}")
                    timestamped_text = (time.time(), text)
                    self.transcription_queue.append(timestamped_text)
                except sr.UnknownValueError:
                    continue
                except sr.RequestError as e:
                    print(f"[Transcriber] API error: {e}")
                    break

    def start(self):
        if not self.running:
            print("[Transcriber] Starting...")
            self.running = True
            self.audio_thread = threading.Thread(target=self._listen_and_transcribe)
            self.audio_thread.start()

    def stop(self):
        print("[Transcriber] Stopping...")
        self.running = False
        if self.audio_thread:
            self.audio_thread.join()

    def get_recent_transcription(self):
        cutoff_time = time.time() - self.buffer_duration
        return " ".join(text for ts, text in self.transcription_queue if ts >= cutoff_time)

# Singleton instance for Flask
transcriber_instance = LiveTranscriber()

if __name__ == "__main__":
    import time
    transcriber_instance.start()
    # time.sleep(5)
    # transcriber_instance.end()