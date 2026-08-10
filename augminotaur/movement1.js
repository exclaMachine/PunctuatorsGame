/* =====================================================================
   movement1.js — Movement 1: Mimicry (call & response)
   ---------------------------------------------------------------------
   The tutorial fight. Strict turn-taking:

     CALL   — he drums a pattern. Mic scoring is OFF, so his own drums
              can't trip the player's onset detector. His eyes are dim.
     (gap)  — one beat of silence, a breath.
     ANSWER — he's silent; the player echoes the pattern back. Mic scoring
              is ON and his eyes brighten (the "your turn" tell). The beat
              pulse keeps the tempo.
     JUDGE  — grade the answer, move him, advance or retry.

   The player must reproduce his exact verbs (BOOM/TSS/KA), on time. A
   clean answer advances a four-pattern ladder (2->4 hits) and pushes him
   back; a flawed answer keeps the pattern and steps him closer. Clear the
   ladder to win (he resolves and fades); let him reach you to lose (he
   fills the screen), then the movement restarts.

   Everything schedules against the M3 BeatClock. Audio is the UI: no HUD,
   read progress off his size and his eyes.
   ===================================================================== */

import { Drums } from "./drums.js";

// Tuned timing windows (HANDOFF), milliseconds around the expected beat.
const WIN_COUNTS = 300;   // beyond this = a miss (perfect/good are inside)

// Phrase geometry, in beats.
const LEAD = 2;           // beats before the first call of a phrase
const CALL_BEATS = 4;     // one bar of call
const GAP = 1;            // breath between call and answer
const ANSWER_BEATS = 4;   // one bar to answer
const REST = 2;           // beats after judging before the next phrase
const JUDGE_MARGIN = 0.5; // wait past the answer bar for late-but-valid hits
const REC_PAD_MS = 350;   // record a hair outside the bar (±300 ms windows)

// Distance tug-of-war (cells down the corridor).
const DIST_START = 8, DIST_MIN = 2, DIST_MAX = 10;
const PUSHBACK = 2;       // clean answer drives him back this many cells
const MISS_CAP = 3;       // most he can close in a single flawed answer

// The four-pattern ladder — grows 2 -> 4 hits, on a 4-beat bar.
const LADDER = [
  [ {beat:0,verb:"BOOM"}, {beat:2,verb:"KA"} ],
  [ {beat:0,verb:"BOOM"}, {beat:1,verb:"KA"},  {beat:2,verb:"BOOM"} ],
  [ {beat:0,verb:"BOOM"}, {beat:2,verb:"TSS"}, {beat:3,verb:"KA"} ],
  [ {beat:0,verb:"BOOM"}, {beat:1,verb:"TSS"}, {beat:2,verb:"KA"}, {beat:3,verb:"BOOM"} ],
];

export class Movement1 {
  /**
   * @param ctx    AudioContext (vi.ctx)
   * @param clock  BeatClock
   * @param opts   { latencyMs, anchorX, corridorY, onDebug }
   */
  constructor(ctx, clock, opts = {}) {
    this.clock = clock;
    this.drums = new Drums(ctx);
    this.latencyMs = opts.latencyMs || 0;
    this.anchorX = opts.anchorX ?? 1.5;   // player x (he stands anchorX+distance away)
    this.corridorY = opts.corridorY ?? 1.5;
    this.onDebug = opts.onDebug || (() => {});

    this.active = true;
    this.result = null;                   // 'win' | 'lose' while shown
    this.rung = 0;
    this.distance = DIST_START;

    // Visual state consumed by sprite.js each frame.
    this.aug = { x: this.anchorX + this.distance, y: this.corridorY, scale: 1, eyeGlow: 0.25, alpha: 1 };
    this._lunge = 0;
    this._eyeTarget = 0.25;

    this.startPhrase();
  }

  /** Schedule one call/answer round from the current beat. */
  startPhrase() {
    const cs = Math.ceil(this.clock.beats()) + LEAD;
    this.callStart = cs;
    this.answerStart = cs + CALL_BEATS + GAP;
    this.answerEnd = this.answerStart + ANSWER_BEATS;
    this.judgeBeat = this.answerEnd + JUDGE_MARGIN;
    this.nextBeat = this.judgeBeat + REST;

    const pat = LADDER[this.rung];

    // His call: schedule the audio ahead (sample-accurate), and remember the
    // beats so update() can trigger a visual lunge as each one lands.
    this.callHits = pat.map(h => ({ beat: cs + h.beat, verb: h.verb, fired: false }));
    for (const h of this.callHits) this.drums.hit(h.verb, this.clock.timeAtBeat(h.beat));

    // The answer he's owed, as perf-domain timestamps to match mic hits to.
    this.expected = pat.map(h => ({
      verb: h.verb,
      perf: this.clock.perfAtBeat(this.answerStart + h.beat),
    }));
    this.recOpen  = this.clock.perfAtBeat(this.answerStart) - REC_PAD_MS;
    this.recClose = this.clock.perfAtBeat(this.answerEnd)   + REC_PAD_MS;
    this.recorded = [];

    this.state = "call";
    this._judged = false;
  }

  /** Route mic events here. Only attack verbs inside the answer window count. */
  onVerb(ev) {
    if (!this.active || this.result) return;
    if (ev.silent || ev.replaces) return;          // ignore _END + HOLD/HISS upgrades
    if (ev.verb !== "BOOM" && ev.verb !== "TSS" && ev.verb !== "KA") return;
    const t = ev.t - this.latencyMs;               // undo measured round-trip latency
    if (t < this.recOpen || t > this.recClose) return;
    this.recorded.push({ t, verb: ev.verb });
  }

  update(dt) {
    if (!this.active) return;
    const b = this.clock.beats();

    // Lunge as each call hit passes.
    if (this.state === "call") {
      for (const h of this.callHits) {
        if (!h.fired && b >= h.beat) { h.fired = true; this._lunge = 1; }
      }
      if (b >= this.answerStart - 0.25) { this.state = "answer"; this._eyeTarget = 1; }
    } else if (this.state === "answer") {
      if (!this._judged && b >= this.judgeBeat) this.judge();
    } else if (this.state === "rest") {
      if (b >= this.nextBeat) this.startPhrase();
    } else if (this.state === "lose") {
      this.aug.alpha = 1;
      if (b >= this._reviveBeat) this.restart();
    } else if (this.state === "win") {
      this.aug.alpha = Math.max(0, this.aug.alpha - dt / 1600); // fade out
    }

    // Tween visual state.
    this._lunge = Math.max(0, this._lunge - dt / 220);
    this.aug.eyeGlow += (this._eyeTarget - this.aug.eyeGlow) * Math.min(1, dt / 120);
    this.aug.x = this.anchorX + this.distance;
    this.aug.scale = 1 + 0.14 * this._lunge;
  }

  judge() {
    this._judged = true;
    const rec = this.recorded.slice();

    // Greedy nearest-in-window match, verb must agree.
    let misses = 0;
    for (const e of this.expected) {
      let best = -1, bestDt = WIN_COUNTS + 1;
      for (let i = 0; i < rec.length; i++) {
        if (rec[i].used || rec[i].verb !== e.verb) continue;
        const dt = Math.abs(rec[i].t - e.perf);
        if (dt <= WIN_COUNTS && dt < bestDt) { best = i; bestDt = dt; }
      }
      if (best >= 0) rec[best].used = true; else misses++;
    }
    const extras = rec.filter(r => !r.used).length;
    const errs = misses + extras;
    const clean = errs === 0;

    this.onDebug(clean ? `✓ ${this.rung + 1}/${LADDER.length}` : `✗ ${errs}`);
    this._eyeTarget = 0.25;

    if (clean) {
      this.distance = Math.min(DIST_MAX, this.distance + PUSHBACK);
      this.rung++;
      if (this.rung >= LADDER.length) return this.win();
    } else {
      this.distance -= Math.min(MISS_CAP, errs);
      if (this.distance <= DIST_MIN) return this.lose();
    }
    this.state = "rest";
  }

  win() {
    this.state = "win";
    this.result = "win";
    this._eyeTarget = 0;
    this.drums.resolve(this.clock.ctx.currentTime + 0.1);
  }

  lose() {
    this.state = "lose";
    this.result = "lose";
    this.distance = DIST_MIN;                 // fills the screen
    this._reviveBeat = this.clock.beats() + 3; // restart the movement after a bar or so
  }

  restart() {
    this.rung = 0;
    this.distance = DIST_START;
    this.result = null;
    this.aug.alpha = 1;
    this.startPhrase();
  }
}
