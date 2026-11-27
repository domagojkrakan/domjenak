// Kratki zvuk praporaca (sintetiziran, bez audio datoteka).
let ctx;

function bell(t, freq, gain) {
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(gain, t + 0.004);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  out.connect(ctx.destination);
  [1, 2.76, 5.4].forEach((ratio, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq * ratio;
    const g = ctx.createGain();
    g.gain.value = [1, 0.5, 0.25][i];
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.4);
  });
}

export function jingle(duration = 1.6) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const start = ctx.currentTime + 0.02;
    for (let t = 0; t < duration; t += 0.07 + Math.random() * 0.06) {
      bell(start + t, 1900 + Math.random() * 900, 0.03 + Math.random() * 0.03);
    }
  } catch {
    /* zvuk nije obavezan */
  }
}
