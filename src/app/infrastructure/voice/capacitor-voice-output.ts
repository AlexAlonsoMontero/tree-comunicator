import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

import { VoiceOutput } from '../../application/voice-output';

export class CapacitorVoiceOutput implements VoiceOutput {
  async speak(text: string): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      await TextToSpeech.speak({
        text,
        lang: 'es-ES',
        rate: 0.9,
        pitch: 1,
        volume: 1,
      });
      return;
    }

    const { voices } = await TextToSpeech.getSupportedVoices();
    const voiceIndex = voices.findIndex(
      (voice) => voice.lang.trim().toLowerCase().split('-')[0] === 'es' && voice.localService,
    );
    if (voiceIndex < 0) {
      throw new Error('No hay una voz española local instalada.');
    }
    await TextToSpeech.speak({
      text,
      lang: voices[voiceIndex]?.lang ?? 'es-ES',
      voice: voiceIndex,
      rate: 0.9,
      pitch: 1,
      volume: 1,
    });
  }
}
