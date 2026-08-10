/* =====================================================================
   drums.js — the Augminotaur's kit (procedural, offline, no assets)
   ---------------------------------------------------------------------
   Three one-shots matching the three mouth-verbs the player answers with:

     BOOM  kick   pitch-dropping sine thud      (the player's "buh"/"puh")
     TSS   hat    short bright noise burst      (the player's "ts"/"ss")
     KA    snare  noise + a short tone body     (the player's "kah")

   Each is scheduled at an AudioContext time so the CALL lands on the beat
   clock. Deliberately short and dry (fast decays, no reverb tail): a CALL
   hit must not ring into the following ANSWER window, or it would bleed
   into the mic and score against the player.

   Also here: resolve() — the augmented triad finally resolving to a major
   chord, played once when the player wins the movement.
   ===================================================================== */

export class Drums {
  constructor(ctx) {
    this.ctx = ctx;
    this.noise = makeNoiseBuffer(ctx); // one shared white-noise buffer
  }

  /** Play a verb at an AudioContext time (default: now). */
  hit(verb, when = this.ctx.currentTime, gain = 1) {
    if (verb === "BOOM") this.kick(when, gain);
    else if (verb === "TSS") this.hat(when, gain);
    else if (verb === "KA") this.snare(when, gain);
  }

  kick(t, g = 1) {
    const { ctx } = this;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.11);
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.9 * g, t + 0.005);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.2);
  }

  hat(t, g = 1) {
    const { ctx } = this;
    const src = ctx.createBufferSource();
    const hp = ctx.createBiquadFilter();
    const amp = ctx.createGain();
    src.buffer = this.noise;
    hp.type = "highpass"; hp.frequency.value = 7000;
    amp.gain.setValueAtTime(0.5 * g, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    src.connect(hp).connect(amp).connect(ctx.destination);
    src.start(t); src.stop(t + 0.07);
  }

  snare(t, g = 1) {
    const { ctx } = this;
    // Noise crack through a bandpass...
    const src = ctx.createBufferSource();
    const bp = ctx.createBiquadFilter();
    const nAmp = ctx.createGain();
    src.buffer = this.noise;
    bp.type = "bandpass"; bp.frequency.value = 1800; bp.Q.value = 0.8;
    nAmp.gain.setValueAtTime(0.55 * g, t);
    nAmp.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    src.connect(bp).connect(nAmp).connect(ctx.destination);
    src.start(t); src.stop(t + 0.15);
    // ...over a short tonal body so it reads as a snare, not just noise.
    const osc = ctx.createOscillator();
    const tAmp = ctx.createGain();
    osc.type = "triangle"; osc.frequency.setValueAtTime(190, t);
    tAmp.gain.setValueAtTime(0.35 * g, t);
    tAmp.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(tAmp).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.11);
  }

  /**
   * The win sting: his symmetric augmented triad slides its top voice down
   * a semitone into a major chord — the resolution the maze denied.
   */
  resolve(when = this.ctx.currentTime) {
    const { ctx } = this;
    const root = 220; // A3
    // Augmented A-C#-F (0,4,8) resolving to A major A-C#-E (0,4,7).
    const aug = [0, 4, 8].map(st => root * Math.pow(2, st / 12));
    const maj = [0, 4, 7].map(st => root * Math.pow(2, st / 12));
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(aug[i], when);
      osc.frequency.setValueAtTime(aug[i], when + 0.9);
      osc.frequency.exponentialRampToValueAtTime(maj[i], when + 1.15);
      amp.gain.setValueAtTime(0.0001, when);
      amp.gain.exponentialRampToValueAtTime(0.18, when + 0.15);
      amp.gain.setValueAtTime(0.18, when + 1.6);
      amp.gain.exponentialRampToValueAtTime(0.0001, when + 2.6);
      osc.connect(amp).connect(ctx.destination);
      osc.start(when); osc.stop(when + 2.7);
    }
  }
}

/** Half a second of white noise, reused by hat and snare. */
function makeNoiseBuffer(ctx) {
  const len = Math.floor(ctx.sampleRate * 0.5);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}
