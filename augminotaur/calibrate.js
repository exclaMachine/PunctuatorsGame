/* =====================================================================
   calibrate.js — level entry + calibration flow
   ---------------------------------------------------------------------
   getUserMedia and AudioContext both need a user gesture, so the descent
   starts behind a tap. After the tap we:

     1. open the mic (VoiceInput.start also runs the 1.6 s noise-floor
        calibration — "be silent")
     2. enroll the player's own BOOM/TSS/KA ("speak in his tongue") —
        skippable, and skipped outright for anyone who already has a full
        set stored. Placed before the latency clicks deliberately: the
        clicks are the boring half, so someone who bails partway through
        has still given us the valuable half.
     3. measure round-trip latency by playing four clicks and listening
        for them come back through the mic ("listen")

   Latency measurement needs the speaker→mic acoustic path, so it fails on
   headphones. That is expected: we fall back to a 0 ms offset and let the
   player continue (or retry). The diegetic "put on the mask" framing for
   the headphone case comes later.

   Returns { vi, offsetMs } once the player dismisses the ready state.
   ===================================================================== */

import { VoiceInput } from "./voice.js";

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Drive the entry overlay to completion.
 * @param {object} refs  { overlay, title, prompt, sub }  DOM elements
 * @returns {Promise<{vi: VoiceInput, offsetMs: number}>}
 */
export async function runEntry(refs){
  const { overlay, title, prompt, sub } = refs;
  const setPrompt = (t, s = "") => { prompt.textContent = t; sub.textContent = s; };

  // ---- tap to descend --------------------------------------------------
  title.textContent = "AUGMINOTAUR";
  setPrompt("tap to descend", "headphones recommended");
  overlay.classList.add("ready-tap");
  await waitForTap(overlay);
  overlay.classList.remove("ready-tap");

  // ---- open the mic + noise floor -------------------------------------
  // start() pops the permission dialog, then listens to the room for
  // 1.6 s. "Be silent" covers that whole window.
  title.textContent = "";
  setPrompt("Be silent…", "listening to the room");

  let vi;
  try {
    vi = await new VoiceInput(() => {}).start();
  } catch (err) {
    setPrompt("The mic stays shut.", describeError(err));
    // Let them tap to retry the whole flow.
    await waitForTap(overlay);
    return runEntry(refs);
  }

  // Nothing else drives the detector while the overlay owns the screen —
  // main.js only starts calling vi.update() once runEntry resolves. Both
  // enrollment and the latency clicks are built on onset events, so they
  // need it pumped here or no event ever fires.
  const stopPump = pump(vi);

  // ---- enroll the player's voice ---------------------------------------
  await runEnrollment(vi, { overlay, setPrompt });

  // ---- latency ---------------------------------------------------------
  setPrompt("Listen…", "four clicks — stay still");
  const offsetMs = await measureLatency(vi);

  if (offsetMs !== null){
    setPrompt("The maze remembers you.", `latency ${Math.round(offsetMs)} ms`);
  } else {
    setPrompt("No echo returned.", "continuing blind — tap to retry, or wait");
  }

  // ---- ready: tap to enter, or auto-enter after a beat -----------------
  overlay.classList.add("ready-tap");
  const raced = await Promise.race([
    waitForTap(overlay).then(() => "tap"),
    sleep(offsetMs !== null ? 1400 : 4000).then(() => "auto"),
  ]);
  overlay.classList.remove("ready-tap");

  // A tap on the failed-measurement state means "retry".
  if (offsetMs === null && raced === "tap"){
    setPrompt("Listen…", "four clicks — stay still");
    const retry = await measureLatency(vi);
    return finish(overlay, vi, retry ?? 0, stopPump);
  }

  return finish(overlay, vi, offsetMs ?? 0, stopPump);
}

function finish(overlay, vi, offsetMs, stopPump){
  stopPump();          // main.js takes over pumping from here
  overlay.classList.add("gone");
  return { vi, offsetMs };
}

/** Drive vi.update() on rAF until the returned stop function is called. */
function pump(vi){
  let on = true;
  const tick = () => { if (!on) return; vi.update(); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  return () => { on = false; };
}

/* ---- enrollment: teach him your three sounds ------------------------- */

const ENROLL = [
  { verb:"BOOM", say:'say “buh”' },
  { verb:"TSS",  say:'say “tss”' },
  { verb:"KA",   say:'say “kah”' },
];
const TAKES        = 3;      // per verb; matches verbmatch's MAX_TAKES
const TAKE_WAIT_MS = 8000;   // silence this long and we stop asking
const MAX_RETRIES  = 3;      // per take, for bursts too short to featurise

/**
 * Walk the three verbs, three takes each (~15 s). A tap anywhere skips the
 * rest; so does a long silence. Anything less than a complete set leaves
 * the matcher un-ready, which means the tilt/mid-share thresholds stay in
 * charge — a partial set is deliberately not used.
 */
async function runEnrollment(vi, { overlay, setPrompt }){
  const forced = new URLSearchParams(location.search).has("enroll");
  if (!forced && vi.matcher.ready()) return;

  setPrompt("Speak in his tongue", "three sounds — tap to skip");
  const skip = tapSignal(overlay);
  await Promise.race([sleep(1500), skip.p]);

  outer:
  for (const step of ENROLL){
    for (let i = 0; i < TAKES; i++){
      let stored = false;
      for (let attempt = 0; attempt < MAX_RETRIES && !stored; attempt++){
        setPrompt(step.verb, step.say + " · " + dots(i, TAKES) +
                  (attempt ? " · again" : ""));
        const got = await captureTake(vi, step.verb, skip.p);
        if (got === "skip" || got === null) break outer;
        stored = got;
      }
      if (!stored) break outer;
      await sleep(240);
    }
  }

  skip.cancel();
  vi.cancelEnroll();

  if (vi.matcher.ready()){
    setPrompt("He knows your voice.", "");
  } else {
    setPrompt("He will misunderstand you.", "the old ears will have to do");
  }
  await sleep(900);
}

/**
 * Arm the detector and wait for one attack to be stored as a take.
 * Enrollment runs through the live onset detector on purpose: the frames
 * we store have to come from the same path as the frames they'll later be
 * matched against.
 * @returns {true|false|null|"skip"} stored / too short / silence / skipped
 */
function captureTake(vi, verb, skipP){
  return new Promise(resolve => {
    const before = vi.onEvent;
    let settled = false;
    const finish = val => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      vi.onEvent = before;
      vi.cancelEnroll();
      resolve(val);
    };
    const timer = setTimeout(() => finish(null), TAKE_WAIT_MS);
    skipP.then(() => finish("skip"));
    vi.onEvent = ev => { if (ev.verb === "ENROLL") finish(ev.takes > 0); };
    vi.enrollNext(verb);
  });
}

/** A tap on the overlay, as a promise you can race and then unhook. */
function tapSignal(el){
  let fire;
  const p = new Promise(resolve => { fire = resolve; });
  const handler = e => { e.preventDefault(); fire("skip"); };
  el.addEventListener("pointerdown", handler);
  return { p, cancel: () => el.removeEventListener("pointerdown", handler) };
}

const dots = (done, total) => "●".repeat(done) + "○".repeat(total - done);

/* ---- latency: play a click, hear it come back ------------------------ */

/**
 * Four clicks; each measures (heard - emitted). Median of what came back.
 * Returns null if fewer than two clicks were heard (e.g. headphones).
 */
async function measureLatency(vi){
  const measured = [];
  for (let i = 0; i < 4; i++){
    const at = vi.ctx.currentTime + 0.25;
    const emittedAt = performance.now() + 250;
    click(vi.ctx, at, 2400);
    const heard = await waitForOnset(vi, 700);
    if (heard !== null) measured.push(heard - emittedAt);
    await sleep(450);
  }
  if (measured.length < 2) return null;
  measured.sort((a,b) => a-b);
  return Math.max(0, measured[Math.floor(measured.length/2)]);
}

/** Temporarily hijack vi.onEvent to catch the next real onset. */
function waitForOnset(vi, timeoutMs){
  return new Promise(resolve => {
    const before = vi.onEvent;
    const done = val => { vi.onEvent = before; resolve(val); };
    vi.onEvent = ev => {
      if (ev.silent || ev.replaces) return;   // ignore _END and HOLD upgrades
      done(ev.t);
    };
    setTimeout(() => { if (vi.onEvent !== before) done(null); }, timeoutMs);
  });
}

function click(ctx, when, freq){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.28, when + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.035);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(when); osc.stop(when + 0.06);
}

/* ---- helpers --------------------------------------------------------- */

function waitForTap(el){
  return new Promise(resolve => {
    const handler = e => {
      e.preventDefault();
      el.removeEventListener("pointerdown", handler);
      resolve();
    };
    el.addEventListener("pointerdown", handler);
  });
}

function describeError(err){
  if (!window.isSecureContext) return 'needs https or localhost';
  if (err && err.name === 'NotAllowedError') return 'microphone blocked';
  if (err && err.name === 'NotFoundError')  return 'no microphone found';
  return 'could not open the microphone';
}
