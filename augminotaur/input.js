/* =====================================================================
   input.js — keyboard + touch intents
   ---------------------------------------------------------------------
   Turns raw events into a set of held "intents" (forward / back / left /
   right). The game loop reads these each frame and, when the player is
   idle, starts one action — so holding a key or a button walks/turns
   continuously, one cell/quarter-turn at a time.

   Desktop: arrows or WASD (down/S = back, for debugging — the phone has
   no back button, only the three thumb buttons ◀ ▲ ▶).
   ===================================================================== */

export function createInput(buttons) {
  const intent = { forward: false, back: false, left: false, right: false };

  const KEYS = {
    ArrowUp: "forward",    KeyW: "forward",
    ArrowDown: "back",     KeyS: "back",
    ArrowLeft: "left",     KeyA: "left",
    ArrowRight: "right",   KeyD: "right",
  };

  addEventListener("keydown", e => {
    const which = KEYS[e.code];
    if (!which) return;
    e.preventDefault();
    intent[which] = true;
  });
  addEventListener("keyup", e => {
    const which = KEYS[e.code];
    if (!which) return;
    intent[which] = false;
  });

  // Touch / mouse buttons. Pointer events cover both; we hold the intent
  // while the finger is down and release it on up/leave/cancel.
  const bind = (el, which) => {
    if (!el) return;
    const set = v => e => { e.preventDefault(); intent[which] = v; };
    el.addEventListener("pointerdown", set(true));
    el.addEventListener("pointerup", set(false));
    el.addEventListener("pointerleave", set(false));
    el.addEventListener("pointercancel", set(false));
  };
  bind(buttons.left, "left");
  bind(buttons.forward, "forward");
  bind(buttons.right, "right");

  return intent;
}
