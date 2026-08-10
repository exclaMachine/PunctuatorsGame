/* =====================================================================
   clock.js — the beat clock
   ---------------------------------------------------------------------
   The single shared timebase. Driven by AudioContext.currentTime, never
   setTimeout/rAF: audio time is monotonic and drift-free, so once the
   Augminotaur's drums and the player's scored hits exist they all line up
   against the same ruler. Milestone 3 uses it for one thing only — the
   wall-shading pulse — but everything later (call & response windows, the
   groove loop, the seam) schedules against these same beat numbers.

   Pure timing source: it makes no sound and touches no canvas. Callers ask
   where we are (beats()/barPhase()) and decide what that means.

   Tempo is the HANDOFF opening tempo (76 BPM). beatsPerBar is 4 so the
   downbeat lands once a bar, which is what the pulse rides.
   ===================================================================== */

export class BeatClock {
  /**
   * @param ctx  a running AudioContext (the mic's vi.ctx)
   * @param bpm  beats per minute
   * @param beatsPerBar  beats between downbeats
   */
  constructor(ctx, bpm = 76, beatsPerBar = 4) {
    this.ctx = ctx;
    this.bpm = bpm;
    this.beatsPerBar = beatsPerBar;
    this.t0 = ctx.currentTime;         // audio time the clock started
    this.t0Perf = performance.now();   // same instant in the perf domain
  }

  /** Seconds per beat. */
  get spb() { return 60 / this.bpm; }

  /** Continuous beat position since start (float, monotonic). */
  beats() {
    return (this.ctx.currentTime - this.t0) / this.spb;
  }

  /** AudioContext time of a beat number — for scheduling sound ahead. */
  timeAtBeat(beat) {
    return this.t0 + beat * this.spb;
  }

  /**
   * performance.now() timestamp of a beat number. Mic events (`ev.t`) are
   * stamped in the perf domain while the clock runs in audio time; this
   * bridges them so scoring can compare a hit to an expected beat in one
   * domain. (Drift over a phrase is sub-millisecond.)
   */
  perfAtBeat(beat) {
    return this.t0Perf + beat * this.spb * 1000;
  }

  /**
   * Beats elapsed since the most recent downbeat, in [0, beatsPerBar).
   * Zero exactly on a downbeat; the pulse envelope decays from there.
   */
  barPhase() {
    const b = this.beats();
    return b - Math.floor(b / this.beatsPerBar) * this.beatsPerBar;
  }
}

/* ---- wall-shading pulse ---------------------------------------------- */
// A few-percent brighten on the downbeat with a quick decay — HANDOFF's
// "visual metronome," present but not distracting. τ is in beats: the lift
// falls to ~10% of peak within ~0.4 beat, so it reads as a flash-and-fade
// rather than a throb across the whole bar.
export const PULSE_AMP = 0.06;   // peak brightness lift (fraction of normal)
export const PULSE_TAU = 0.17;   // decay time constant, in beats

/**
 * Light multiplier for the raycaster this frame (1 = normal, >1 brighter).
 * @param clock  a BeatClock
 */
export function pulseLight(clock) {
  return 1 + PULSE_AMP * Math.exp(-clock.barPhase() / PULSE_TAU);
}
