/* =====================================================================
   voice.js — offline mouth-verb detector
   ---------------------------------------------------------------------
   Extracted verbatim from augminotaur-input-bench.html (the tuned bench).
   Behaviour is intentionally unchanged — only the surrounding bench UI
   was dropped. Emits four verbs with no speech recognition and no
   network:

     BOOM  plosive, energy below 250 Hz        "buh" / "puh"
     TSS   sibilant, energy above 3 kHz        "ts" / "ss"
     HOLD  sustained + voiced                  "aaah"
     HISS  sustained + unvoiced                "shhh"

   BOOM and TSS fire on the attack, so they are timing-accurate.
   HOLD and HISS are upgrades: a sustained note starts life as a BOOM or
   TSS, and is reclassified once it outlives the sustain threshold. The
   original event is emitted immediately (keeps rhythm honest) and then
   retracted via a `replaces` field.

   Event shape: { id, verb, t, tilt, zcr, level, replaces? }.
   `t` is a performance.now() timestamp; always score sustained notes on
   `ev.t` (when the note started), never on when the event arrived.
   *_END events carry `duration` and should not count as hits.

   getUserMedia requests echoCancellation/noiseSuppression/autoGainControl
   all OFF — every one of them mangles plosives and sibilants. Do not
   change that.
   ===================================================================== */

export class VoiceInput {
  constructor(onEvent){
    this.onEvent = onEvent;
    this.ctx = null;
    this.stream = null;
    this.running = false;

    // Tunables (mirrored by the bench sliders)
    this.gateMult    = 4.0;
    this.riseRatio   = 1.7;
    this.refractMs   = 80;
    this.tiltBoom    = 0.62;
    this.tiltTss     = 0.42;
    this.holdMs      = 250;
    this.voicedMaxHz = 2000;

    // Snare "ka" (a beatbox snare — "kah"). A mid-band plosive that lives
    // between the low/high crossovers, where the two-pole tilt can't see
    // it. Carved out by mid-share so BOOM/TSS keep their tuned thresholds.
    this.kaMidShare  = 0.45;   // mid must be at least this share of low+mid+high
    this.midHz       = 1500;   // bandpass center for the /k/ burst
    this.midQ        = 0.9;    // bandpass width

    // Fixed constants
    this.captureMs   = 55;    // window used to classify an attack
    this.lowHz       = 250;
    this.highHz      = 3000;
    this.floorFloor  = 0.0008;

    // State
    this.noiseFloor = 0.004;
    this.slowAvg    = 0;
    this.lastOnset  = -1e9;
    this.capture    = null;
    this.sustain    = null;
    this.eventId    = 0;
    this.frame      = { rms:0, low:0, high:0, tilt:0.5, zcr:0, t:0 };
    this.history    = [];
  }

  async start(){
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    await this.ctx.resume();

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        // All three of these mangle plosives and sibilants. Off, always.
        echoCancellation:false,
        noiseSuppression:false,
        autoGainControl:false,
        channelCount:1
      }
    });

    const src = this.ctx.createMediaStreamSource(this.stream);

    const mkAnalyser = () => {
      const a = this.ctx.createAnalyser();
      a.fftSize = 1024;            // ~21 ms at 48 kHz
      a.smoothingTimeConstant = 0;
      return a;
    };

    this.aFull = mkAnalyser();
    this.aLow  = mkAnalyser();
    this.aHigh = mkAnalyser();
    this.aMid  = mkAnalyser();

    // Two cascaded biquads per band = 24 dB/oct, enough separation that a
    // "buh" and a "tss" sit at opposite ends of the tilt axis.
    const chain = (type, freq, dest) => {
      const f1 = this.ctx.createBiquadFilter();
      const f2 = this.ctx.createBiquadFilter();
      f1.type = f2.type = type;
      f1.frequency.value = f2.frequency.value = freq;
      f1.Q.value = f2.Q.value = 0.707;
      src.connect(f1); f1.connect(f2); f2.connect(dest);
    };

    src.connect(this.aFull);
    chain('lowpass',  this.lowHz,  this.aLow);
    chain('highpass', this.highHz, this.aHigh);

    // Mid band (bandpass) captures the snare "ka" burst that sits between
    // the crossovers. Filter refs are kept so center/Q stay live-tunable
    // (update() writes the current midHz/midQ each frame).
    const mf1 = this.ctx.createBiquadFilter();
    const mf2 = this.ctx.createBiquadFilter();
    mf1.type = mf2.type = 'bandpass';
    mf1.frequency.value = mf2.frequency.value = this.midHz;
    mf1.Q.value = mf2.Q.value = this.midQ;
    src.connect(mf1); mf1.connect(mf2); mf2.connect(this.aMid);
    this.midFilters = [mf1, mf2];

    this.buf     = new Float32Array(this.aFull.fftSize);
    this.bufLow  = new Float32Array(this.aLow.fftSize);
    this.bufHigh = new Float32Array(this.aHigh.fftSize);
    this.bufMid  = new Float32Array(this.aMid.fftSize);

    this.running = true;
    await this.calibrate();
    return this;
  }

  stop(){
    this.running = false;
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.ctx) this.ctx.close();
  }

  /** Listen to an empty room for 1.6 s and set the gate from what's there. */
  calibrate(){
    return new Promise(resolve => {
      const samples = [];
      const until = performance.now() + 1600;
      const tick = () => {
        this.aFull.getFloatTimeDomainData(this.buf);
        samples.push(rms(this.buf));
        if (performance.now() < until) return requestAnimationFrame(tick);
        samples.sort((a,b) => a-b);
        const median = samples[Math.floor(samples.length * 0.5)];
        const p90    = samples[Math.floor(samples.length * 0.9)];
        this.noiseFloor = Math.max(this.floorFloor, median * 0.6 + p90 * 0.4);
        this.slowAvg = this.noiseFloor;
        resolve(this.noiseFloor);
      };
      requestAnimationFrame(tick);
    });
  }

  /** Call once per animation frame. Returns the current feature frame. */
  update(){
    if (!this.running) return this.frame;
    const now = performance.now();

    // Keep the mid bandpass in step with the live-tuned knobs.
    if (this.midFilters){
      this.midFilters[0].frequency.value = this.midFilters[1].frequency.value = this.midHz;
      this.midFilters[0].Q.value = this.midFilters[1].Q.value = this.midQ;
    }

    this.aFull.getFloatTimeDomainData(this.buf);
    this.aLow.getFloatTimeDomainData(this.bufLow);
    this.aHigh.getFloatTimeDomainData(this.bufHigh);
    this.aMid.getFloatTimeDomainData(this.bufMid);

    const e     = rms(this.buf);
    const eLow  = rms(this.bufLow);
    const eHigh = rms(this.bufHigh);
    const eMid  = rms(this.bufMid);
    const tilt  = eLow / (eLow + eHigh + 1e-9);
    const zcr   = zeroCrossRate(this.buf, this.ctx.sampleRate);
    const gate  = this.noiseFloor * this.gateMult;

    const prevAvg = this.slowAvg;
    this.slowAvg = this.slowAvg * 0.90 + e * 0.10;

    // ---- onset ----
    const loud   = e > gate;
    const rising = e > prevAvg * this.riseRatio;
    const free   = now - this.lastOnset > this.refractMs;

    if (loud && rising && free && !this.capture){
      this.lastOnset = now;
      this.capture = { t:now, maxLow:eLow, maxMid:eMid, maxHigh:eHigh, zcrSum:zcr, n:1 };
    }

    // ---- classify the attack ----
    if (this.capture){
      const c = this.capture;
      c.maxLow  = Math.max(c.maxLow, eLow);
      c.maxMid  = Math.max(c.maxMid, eMid);
      c.maxHigh = Math.max(c.maxHigh, eHigh);
      c.zcrSum += zcr; c.n++;

      if (now - c.t >= this.captureMs){
        const cTilt = c.maxLow / (c.maxLow + c.maxHigh + 1e-9);
        const cMid  = c.maxMid / (c.maxLow + c.maxMid + c.maxHigh + 1e-9);
        const cZcr  = c.zcrSum / c.n;
        // KA is checked first: a real "buh"/"tss" is low-/high-dominant so
        // its mid share stays below the threshold and it falls through to
        // the untouched BOOM/TSS logic.
        let verb;
        if (cMid >= this.kaMidShare)     verb = 'KA';
        else if (cTilt >= this.tiltBoom) verb = 'BOOM';
        else if (cTilt <= this.tiltTss)  verb = 'TSS';
        else                             verb = cZcr < this.voicedMaxHz ? 'BOOM' : 'TSS';

        const id = ++this.eventId;
        this.emit({ id, verb, t:c.t, tilt:cTilt, mid:cMid, zcr:cZcr,
                    level:c.maxLow + c.maxMid + c.maxHigh });
        // A snare is a hit, not a sustain — KA doesn't spawn a HOLD/HISS watch.
        if (verb !== 'KA') this.sustain = { id, t:c.t, zcrSum:0, n:0, resolved:false };
        this.capture = null;
      }
    }

    // ---- upgrade to a sustained verb ----
    if (this.sustain){
      const s = this.sustain;
      if (e > gate * 0.6){
        s.zcrSum += zcr; s.n++;
        if (!s.resolved && now - s.t >= this.holdMs){
          const avgZcr = s.zcrSum / Math.max(1, s.n);
          const verb = avgZcr < this.voicedMaxHz ? 'HOLD' : 'HISS';
          this.emit({ id:++this.eventId, verb, t:s.t, tilt, zcr:avgZcr, level:e, replaces:s.id });
          s.resolved = true;
          s.verb = verb;
        }
      } else {
        if (s.resolved){
          this.emit({ id:++this.eventId, verb:s.verb + '_END', t:now,
                      duration:now - s.t, tilt, zcr, level:e, silent:true });
        }
        this.sustain = null;
      }
    }

    this.frame = { rms:e, low:eLow, mid:eMid, high:eHigh, tilt, zcr, t:now, gate };
    this.history.push({ t:now, rms:e, tilt, gate });
    const cutoff = now - 6000;
    while (this.history.length && this.history[0].t < cutoff) this.history.shift();

    return this.frame;
  }

  emit(ev){ if (this.onEvent) this.onEvent(ev); }
}

export function rms(b){
  let s = 0;
  for (let i = 0; i < b.length; i++) s += b[i] * b[i];
  return Math.sqrt(s / b.length);
}

export function zeroCrossRate(b, sampleRate){
  let c = 0;
  for (let i = 1; i < b.length; i++){
    if ((b[i-1] < 0 && b[i] >= 0) || (b[i-1] >= 0 && b[i] < 0)) c++;
  }
  return (c * sampleRate) / (2 * b.length);
}
