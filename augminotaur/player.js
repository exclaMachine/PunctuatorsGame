/* =====================================================================
   player.js — grid-step ("tank") movement
   ---------------------------------------------------------------------
   The player always faces one of four cardinal directions and lives on
   one cell. Actions are discrete — turn 90 degrees, or step one cell —
   but they TWEEN so the view slides rather than snapping. Only one
   action runs at a time; input is ignored while an action animates
   (holding a key just re-fires the next action when the current ends).

   Positions are in cell units; a cell's centre is n + 0.5. Angle is in
   radians, 0 = +x (east), increasing clockwise on screen (y points down,
   matching MAP row order).
   ===================================================================== */

import { isWall } from "./map.js";

const TURN_MS = 150;   // 90-degree turn
const STEP_MS = 175;   // one-cell walk
const BUMP_MS = 130;   // "you walked into a wall" nudge
const BUMP_DEPTH = 0.14;

// smoothstep — ease in and out
const smooth = p => p * p * (3 - 2 * p);
const TAU = Math.PI * 2;

export class Player {
  constructor({ x, y, angle }) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.anim = null; // null = idle and ready for input
  }

  get idle() { return this.anim === null; }
  get dirX() { return Math.cos(this.angle); }
  get dirY() { return Math.sin(this.angle); }

  /** sign: -1 = turn left (CCW), +1 = turn right (CW). */
  turn(sign) {
    if (this.anim) return;
    this.anim = {
      type: "turn",
      from: this.angle,
      to: this.angle + sign * (Math.PI / 2),
      t: 0, dur: TURN_MS,
    };
  }

  /** sign: +1 = forward, -1 = backward. Blocked cells produce a bump. */
  step(sign, map) {
    if (this.anim) return;
    // Snapped facing -> integer cell delta (exact at cardinal angles).
    const dc = Math.round(Math.cos(this.angle)) * sign;
    const dr = Math.round(Math.sin(this.angle)) * sign;
    const cx = Math.floor(this.x), cy = Math.floor(this.y);
    const tx = cx + dc, ty = cy + dr;

    if (isWall(map, tx, ty)) {
      this.anim = { type: "bump", fromX: this.x, fromY: this.y, dc, dr, t: 0, dur: BUMP_MS };
      return;
    }
    this.anim = {
      type: "step",
      fromX: this.x, fromY: this.y,
      toX: tx + 0.5, toY: ty + 0.5,
      t: 0, dur: STEP_MS,
    };
  }

  update(dtMs) {
    const a = this.anim;
    if (!a) return;
    a.t += dtMs;
    const p = Math.min(1, a.t / a.dur);
    const e = smooth(p);

    if (a.type === "turn") {
      this.angle = a.from + (a.to - a.from) * e;
    } else if (a.type === "step") {
      this.x = a.fromX + (a.toX - a.fromX) * e;
      this.y = a.fromY + (a.toY - a.fromY) * e;
    } else if (a.type === "bump") {
      const k = Math.sin(p * Math.PI) * BUMP_DEPTH; // out and back
      this.x = a.fromX + a.dc * k;
      this.y = a.fromY + a.dr * k;
    }

    if (p >= 1) {
      if (a.type === "turn") this.angle = ((a.to % TAU) + TAU) % TAU;
      else if (a.type === "step") { this.x = a.toX; this.y = a.toY; }
      else if (a.type === "bump") { this.x = a.fromX; this.y = a.fromY; }
      this.anim = null;
    }
  }
}
