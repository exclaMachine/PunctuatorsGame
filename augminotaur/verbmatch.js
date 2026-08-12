/* =====================================================================
   verbmatch.js — speaker-enrolled mouth-verb templates (MFCC + DTW)
   ---------------------------------------------------------------------
   Ported from kaimoju-mic-test.html, the voice-match probe that proved
   this approach offline (≥85% on five confusable Japanese onomatopoeia
   with three takes each). Three beatbox verbs is an easier problem.

   This is NOT speech recognition. It compares the timbre of a burst
   against recordings THE PLAYER MADE of their own BOOM / TSS / KA, on
   this device, and never touches the network.

   Division of labour with voice.js:

     the onset detector owns  WHEN  (capture.t → ev.t, untouched)
     these templates own      WHAT  (which of the three verbs it was)

   so hit timing — and therefore movement1.js scoring and the measured
   latency offset — is completely unaffected by anything in this file.

   A burst becomes: MFCC frames → cepstral mean normalisation (kills mic
   and level offset) → resample to NORM_FRAMES → DTW against each stored
   take. Best distance wins if it clears MATCH_TH and beats the runner-up
   by MARGIN; otherwise the caller falls back to voice.js's thresholds.
   We never drop a hit — a dropped real hit reads as a miss in
   movement1.js, which is worse than a misclassification.
   ===================================================================== */

export const VERBS = ["BOOM", "TSS", "KA"];

const LS_KEY   = "augminotaur.verbTemplates.v1";  // versioned: a feature change invalidates
const MAX_TAKES  = 3;
const NUM_MEL    = 26;
const NUM_MFCC   = 13;
const MEL_LO_HZ  = 80;
const MEL_HI_HZ  = 8000;
const NORM_FRAMES = 8;   // every burst is resampled to this many frames
const MIN_FRAMES  = 3;   // fewer than this and we can't say anything

export class VerbMatcher {
  constructor(){
    this.templates = load();

    // Tunables (mirrored by the bench sliders).
    this.matchTh = 34;    // accept only if the best DTW distance is under this
    this.margin  = 0.80;  // ...and best/second is under this (i.e. a clear winner)

    this.melFilters = null;
    this.dctTable   = null;
    this.numBins    = 0;
  }

  /** Build the mel filterbank + DCT table for a live analyser. */
  configure(sampleRate, fftSize, binCount){
    this.numBins = binCount;

    const hzToMel = f => 2595 * Math.log10(1 + f / 700);
    const melToHz = m => 700 * (Math.pow(10, m / 2595) - 1);

    const hiHz  = Math.min(sampleRate / 2, MEL_HI_HZ);
    const loMel = hzToMel(MEL_LO_HZ), hiMel = hzToMel(hiHz);
    const edges = [];
    for (let i = 0; i < NUM_MEL + 2; i++){
      const hz = melToHz(loMel + (hiMel - loMel) * i / (NUM_MEL + 1));
      edges.push(Math.floor((fftSize + 1) * hz / sampleRate));
    }

    this.melFilters = [];
    for (let m = 1; m <= NUM_MEL; m++){
      const a = edges[m-1], b = edges[m], c = edges[m+1], w = [];
      for (let k = a; k < c; k++){
        if (k < 0 || k >= binCount) continue;
        const g = k < b ? (k - a) / Math.max(1, b - a)
                        : (c - k) / Math.max(1, c - b);
        if (g > 0) w.push({ bin:k, g });
      }
      this.melFilters.push(w);
    }

    this.dctTable = [];
    for (let k = 0; k < NUM_MFCC; k++){
      const row = new Float32Array(NUM_MEL);
      for (let n = 0; n < NUM_MEL; n++) row[n] = Math.cos(Math.PI / NUM_MEL * (n + 0.5) * k);
      this.dctTable.push(row);
    }
  }

  /** One MFCC frame from an analyser's current getFloatFrequencyData (dB/bin). */
  frame(freqBuf){
    if (!this.melFilters) return null;
    const mel = new Float32Array(NUM_MEL);
    for (let m = 0; m < NUM_MEL; m++){
      let e = 0;
      const w = this.melFilters[m];
      for (let i = 0; i < w.length; i++){
        const db  = freqBuf[w[i].bin];
        const mag = db <= -140 ? 0 : Math.pow(10, db / 20);
        e += mag * mag * w[i].g;
      }
      mel[m] = Math.log(e + 1e-8);
    }
    const c = new Float32Array(NUM_MFCC);
    for (let k = 0; k < NUM_MFCC; k++){
      let s = 0;
      const row = this.dctTable[k];
      for (let n = 0; n < NUM_MEL; n++) s += mel[n] * row[n];
      c[k] = s;
    }
    return c;
  }

  /** True once every verb has at least one take — templates are all-or-nothing. */
  ready(){
    return VERBS.every(v => (this.templates[v] || []).length > 0);
  }

  counts(){
    const out = {};
    for (const v of VERBS) out[v] = (this.templates[v] || []).length;
    return out;
  }

  /**
   * Store a burst as a take. Oldest take falls off past MAX_TAKES.
   * @returns {number} how many takes that verb now has (0 = rejected)
   */
  enroll(verb, frames){
    const prepped = prepare(frames);
    if (!prepped) return 0;
    const list = this.templates[verb] || (this.templates[verb] = []);
    list.push(prepped);
    while (list.length > MAX_TAKES) list.shift();
    save(this.templates);
    return list.length;
  }

  clear(verb){
    if (verb) delete this.templates[verb];
    else this.templates = {};
    save(this.templates);
  }

  /**
   * Match a burst against every stored take.
   * @returns {?{verb:string, dist:number, second:number, ok:boolean, per:object}}
   *          null if the burst was too short to judge. `ok` false means
   *          "no confident winner" — the caller should use its fallback,
   *          but `verb`/`dist` are still filled in for the bench readout.
   */
  classify(frames){
    const probe = prepare(frames);
    if (!probe) return null;

    const per = {};
    let best = null, bestD = Infinity, second = Infinity;
    for (const v of VERBS){
      let d = Infinity;
      for (const t of (this.templates[v] || [])) d = Math.min(d, dtw(probe, t));
      per[v] = d;
      if (d < bestD){ second = bestD; bestD = d; best = v; }
      else if (d < second){ second = d; }
    }
    if (best === null || bestD === Infinity) return null;

    const clear = bestD < this.matchTh &&
                  (second === Infinity || bestD / second < this.margin);
    return { verb:best, dist:bestD, second, ok:clear, per };
  }
}

/* ---- feature prep ---------------------------------------------------- */

/** CMN, then resample to a fixed frame count. Returns null if too short. */
function prepare(frames){
  if (!frames || frames.length < MIN_FRAMES) return null;
  return resample(cmn(frames), NORM_FRAMES);
}

/** Cepstral mean normalisation — removes the channel/level offset. */
function cmn(frames){
  const d = frames[0].length;
  const mean = new Float64Array(d);
  for (const f of frames) for (let i = 0; i < d; i++) mean[i] += f[i];
  for (let i = 0; i < d; i++) mean[i] /= frames.length;
  return frames.map(f => {
    const o = new Float32Array(d);
    for (let i = 0; i < d; i++) o[i] = f[i] - mean[i];
    return o;
  });
}

/** Linear-interpolated resample along the time axis to exactly `n` frames. */
function resample(frames, n){
  if (frames.length === n) return frames;
  const d = frames.length, dim = frames[0].length, out = [];
  for (let i = 0; i < n; i++){
    const x  = d === 1 ? 0 : (i * (d - 1)) / (n - 1);
    const i0 = Math.floor(x), i1 = Math.min(d - 1, i0 + 1), f = x - i0;
    const a = frames[i0], b = frames[i1], o = new Float32Array(dim);
    for (let k = 0; k < dim; k++) o[k] = a[k] + (b[k] - a[k]) * f;
    out.push(o);
  }
  return out;
}

/** DTW distance, Euclidean local cost, length-normalised. */
function dtw(A, B){
  const m = A.length, n = B.length;
  let prev = new Float64Array(n + 1).fill(Infinity); prev[0] = 0;
  let cur  = new Float64Array(n + 1);
  for (let i = 1; i <= m; i++){
    cur.fill(Infinity); cur[0] = Infinity;
    const Ai = A[i-1];
    for (let j = 1; j <= n; j++){
      const Bj = B[j-1];
      let d = 0;
      for (let k = 0; k < Ai.length; k++){ const x = Ai[k] - Bj[k]; d += x * x; }
      cur[j] = Math.sqrt(d) + Math.min(prev[j], cur[j-1], prev[j-1]);
    }
    const t = prev; prev = cur; cur = t;
  }
  return prev[n] / (m + n);
}

/* ---- storage --------------------------------------------------------- */

function load(){
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY));
    if (!raw || typeof raw !== "object") return {};
    const out = {};
    for (const v of VERBS){
      if (!Array.isArray(raw[v])) continue;
      // Rehydrate to typed arrays; drop anything malformed rather than
      // half-trusting it (a bad take poisons every match against it).
      const takes = raw[v]
        .filter(t => Array.isArray(t) && t.length === NORM_FRAMES)
        .map(t => t.map(f => Float32Array.from(f)))
        .filter(t => t.every(f => f.length === NUM_MFCC));
      if (takes.length) out[v] = takes;
    }
    return out;
  } catch (_){ return {}; }
}

function save(templates){
  try {
    const plain = {};
    for (const v of VERBS){
      if (!templates[v] || !templates[v].length) continue;
      // 3 dp keeps the store tiny; DTW distances don't notice.
      plain[v] = templates[v].map(t => Array.from(t, f => Array.from(f, x => +x.toFixed(3))));
    }
    localStorage.setItem(LS_KEY, JSON.stringify(plain));
  } catch (_){ /* private mode / quota — templates just won't persist */ }
}
