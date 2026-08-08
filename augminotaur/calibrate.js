/* =====================================================================
   calibrate.js — level entry + calibration flow
   ---------------------------------------------------------------------
   getUserMedia and AudioContext both need a user gesture, so the descent
   starts behind a tap. After the tap we:

     1. open the mic (VoiceInput.start also runs the 1.6 s noise-floor
        calibration — "be silent")
     2. measure round-trip latency by playing four clicks and listening
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
    return finish(overlay, vi, retry ?? 0);
  }

  return finish(overlay, vi, offsetMs ?? 0);
}

function finish(overlay, vi, offsetMs){
  overlay.classList.add("gone");
  return { vi, offsetMs };
}

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
