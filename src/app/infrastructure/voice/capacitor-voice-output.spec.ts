import { beforeEach, describe, expect, it, vi } from 'vitest';

const { speak, getSupportedVoices, getPlatform } = vi.hoisted(() => ({
  speak: vi.fn(),
  getSupportedVoices: vi.fn(),
  getPlatform: vi.fn(),
}));

vi.mock('@capacitor-community/text-to-speech', () => ({
  TextToSpeech: { speak, getSupportedVoices },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform },
}));

import { CapacitorVoiceOutput } from './capacitor-voice-output';

describe('CapacitorVoiceOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPlatform.mockReturnValue('android');
  });

  it('RD-003 uses a locally installed Spanish voice without network fallback', async () => {
    getSupportedVoices.mockResolvedValue({
      voices: [
        { lang: 'en-US', localService: true },
        { lang: 'es-ES', localService: true },
      ],
    });
    const output = new CapacitorVoiceOutput();

    await output.speak('Me encuentro mal');

    expect(speak).toHaveBeenCalledWith({
      text: 'Me encuentro mal',
      lang: 'es-ES',
      voice: 1,
      rate: 0.9,
      pitch: 1,
      volume: 1,
    });
  });

  it('matches locally installed Spanish voices with case-insensitive BCP-47 tags', async () => {
    getSupportedVoices.mockResolvedValue({
      voices: [
        { lang: 'en-US', localService: true },
        { lang: 'ES-es', localService: true },
      ],
    });

    await new CapacitorVoiceOutput().speak('Hola');

    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({ lang: 'ES-es', voice: 1, text: 'Hola' }),
    );
  });

  it('fails safely when no local Spanish voice is installed on native Android', async () => {
    getSupportedVoices.mockResolvedValue({ voices: [{ lang: 'es-ES', localService: false }] });

    await expect(new CapacitorVoiceOutput().speak('Hola')).rejects.toThrow(
      'No hay una voz española local instalada.',
    );
    expect(speak).not.toHaveBeenCalled();
  });

  it('allows the web SpeechSynthesis implementation to speak Spanish before voices are preloaded', async () => {
    getPlatform.mockReturnValue('web');

    await new CapacitorVoiceOutput().speak('Hola');

    expect(getSupportedVoices).not.toHaveBeenCalled();
    expect(speak).toHaveBeenCalledWith({
      text: 'Hola',
      lang: 'es-ES',
      rate: 0.9,
      pitch: 1,
      volume: 1,
    });
  });
});
