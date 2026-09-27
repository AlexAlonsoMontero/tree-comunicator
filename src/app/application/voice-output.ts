export interface VoiceOutput {
  speak(text: string): Promise<void>;
}
