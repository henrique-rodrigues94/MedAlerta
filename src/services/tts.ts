import * as Speech from 'expo-speech';

let falando = false;

export async function falar(texto: string): Promise<void> {
  try {
    const disponivel = await Speech.getAvailableVoicesAsync();
    if (!disponivel || disponivel.length === 0) return;
    if (falando) await Speech.stop();
    falando = true;
    await Speech.speak(texto, {
      language: 'pt-BR',
      pitch: 1.0,
      rate: 0.85,
      onDone: () => { falando = false; },
      onError: () => { falando = false; },
    });
  } catch (err) {
    falando = false;
  }
}

export function pararFala(): void {
  Speech.stop();
  falando = false;
}
