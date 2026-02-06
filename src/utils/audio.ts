// Un pequeño sintetizador para no depender de archivos mp3 externos
export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Configuración para un sonido tipo "Campana suave"
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // Do (C5)
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // Sube a Do (C6)

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05); // Fade in rápido
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Fade out suave

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio error", e);
  }
};
