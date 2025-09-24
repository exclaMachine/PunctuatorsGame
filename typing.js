// typing.js — standalone Typing Game (refined spawn + second-sprite shoot anim)

const CANVAS = document.getElementById("tg-canvas");
const CTX = CANVAS.getContext("2d");
const HUD = {
  score: document.getElementById("tg-score"),
  streak: document.getElementById("tg-streak"),
  count: document.getElementById("tg-count"),
};
const HERO_NAME_EL = document.getElementById("tg-hero-name");
const copySfx = new Howl({ src: ["./sounds/click.mp3"], volume: 0.7 });
const saveSfx = new Howl({
  src: ["./sounds/click.mp3"],
  rate: 1.15,
  volume: 0.7,
});

function fitCanvas() {
  const cssW = CANVAS.clientWidth,
    cssH = CANVAS.clientHeight;
  const dpr = window.devicePixelRatio || 1;
  CANVAS.width = Math.floor(cssW * dpr);
  CANVAS.height = Math.floor(cssH * dpr);
  CTX.setTransform(dpr, 0, 0, dpr, 0, 0);
  // keep hero pinned to bottom-center on resize so offsets stay correct
  //if (hero && hero.width) hero.centerBottom();
}
window.addEventListener("resize", fitCanvas);
fitCanvas();

const IDB_DB = "tg-vocab";
const IDB_STORE = "handles";

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function idbGet(key) {
  return idbOpen().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const store = tx.objectStore(IDB_STORE);
        const r = store.get(key);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      })
  );
}
function idbSet(key, val) {
  return idbOpen().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        const store = tx.objectStore(IDB_STORE);
        const r = store.put(val, key);
        r.onsuccess = () => resolve();
        r.onerror = () => reject(r.error);
      })
  );
}

/* ---------- Hero / Projectiles ---------- */

class Hero {
  constructor({
    heroImage,
    secondHeroImage = null,
    heroScale = 0.5,
    symbol,
    color = "black",
    projectileImage,
    projectileScale = 0.2,
    projectileStartOffsetX = 118,
    shootSrc,
    hitSrc,
    useTongue = false,
  }) {
    this.symbol = symbol;
    this.color = color;
    this.projectileImage = projectileImage || null;
    this.projectileScale = projectileScale;
    this.projectileStartOffsetX = projectileStartOffsetX;
    this.useTongue = useTongue;

    this.image = new Image();
    this.image.src = heroImage;
    this.image2 = null;
    if (secondHeroImage && secondHeroImage !== "white") {
      this.image2 = new Image();
      this.image2.src = secondHeroImage;
    }

    this.scale = heroScale;
    this.width = 0;
    this.height = 0;
    this.pos = { x: 0, y: 0 };
    this.drawSecondFrame = false;

    this.sfx = {
      shoot: shootSrc ? new Howl({ src: [shootSrc] }) : null,
      hit: hitSrc ? new Howl({ src: [hitSrc] }) : null,
    };

    this.image.onload = () => {
      this.width = this.image.width * this.scale;
      this.height = this.image.height * this.scale;
      this.centerBottom();
    };
  }
  centerBottom() {
    this.pos.x = CANVAS.clientWidth / 2 - this.width / 2;
    this.pos.y = CANVAS.clientHeight - this.height + 20;
  }
  draw() {
    if (!this.width) return;
    const sprite =
      this.drawSecondFrame && this.image2 ? this.image2 : this.image;
    CTX.drawImage(sprite, this.pos.x, this.pos.y, this.width, this.height);
  }
  shootSound() {
    try {
      this.sfx.shoot?.play();
    } catch {}
  }
  hitSound() {
    try {
      this.sfx.hit?.play();
    } catch {}
  }
}

class Projectile {
  constructor(hero) {
    this.vx = 0;
    this.vy = -10;
    // NORMAL PROJECTILE SPAWN — use width - offset to match your desired alignment
    this.x = hero.pos.x + hero.projectileStartOffsetX;
    this.y = hero.pos.y;
    this.w = 3;
    this.h = 18;
    this.img = null;
    if (hero.projectileImage) {
      const im = new Image();
      im.src = hero.projectileImage;
      im.onload = () => {
        this.img = im;
        this.w = im.width * hero.projectileScale;
        this.h = im.height * hero.projectileScale;
      };
    }
  }
  update() {
    this.y += this.vy;
  }
  draw() {
    if (this.img) CTX.drawImage(this.img, this.x, this.y, this.w, this.h);
    else {
      CTX.fillStyle = "#f33";
      CTX.fillRect(this.x, this.y, this.w, this.h);
    }
  }
}

class CommaTongue {
  constructor(hero) {
    this.vx = 0;
    this.vy = -10;
    this.w = 5;
    this.h = 100;
    // Tongue/paint spawn matches your main game rule
    this.x = hero.pos.x + hero.width - hero.projectileStartOffsetX;
    this.y = hero.pos.y;
  }
  update() {
    this.y += this.vy;
  }
  draw() {
    CTX.fillStyle = "pink";
    CTX.fillRect(this.x, this.y - this.h, this.w, this.h);
  }
}

/* ---------- Roster (same as before; omitted here for brevity) ---------- */
/* Paste the same HEROES array you already have (with secondHeroImage filled). */

const HEROES = [
  // Full Stop
  {
    heroImage: "./images/fs.png",
    secondHeroImage: undefined,
    heroScale: 0.5,
    symbol: "Full Stop .",
    color: "red",
    projectileImage: "./images/Laser.png",
    projectileScale: 0.2,
    projectileStartOffsetX: 110,
    shootSrc: "./sounds/laser-bolt.mp3",
    hitSrc: "./sounds/projectile-hit/laser-hit.mp3",
  },

  // Full Stop (Capitalize)
  {
    heroImage: "./images/FS_capital1.png",
    secondHeroImage: "./images/FS_capital2.png",
    heroScale: 0.5,
    symbol: "Full Stop (Capitalize)",
    color: "red",
    projectileImage: "./images/Grenade.png",
    projectileScale: 0.2,
    projectileStartOffsetX: 110,
    shootSrc: "./sounds/whoosh.mp3",
  },

  // Excla Machine
  {
    heroImage: "./images/EM.png",
    secondHeroImage: "./images/EM_Belt2.png",
    heroScale: 0.6,
    symbol: "Excla Machine !",
    color: "yellow",
    projectileImage: "./images/EM_Belt.png",
    projectileScale: 0.5,
    projectileStartOffsetX: 118,
    shootSrc: "./sounds/whoosh.mp3",
  },

  // Question Markswoman
  {
    heroImage: "./images/qm.png",
    secondHeroImage: "./images/QM2.png",
    heroScale: 0.7,
    symbol: "Question Markswoman ?",
    color: "blue",
    projectileImage: "./images/Arrow.png",
    projectileScale: 0.2,
    projectileStartOffsetX: 126,
    shootSrc: "./sounds/arrow-shot.mp3",
  },

  // Master Asterisk
  {
    heroImage: "./images/Asterisk.png",
    secondHeroImage: "./images/Asterisk2.png",
    heroScale: 0.35,
    symbol: "Master Asterisk *",
    color: "gold",
    projectileImage: "./images/Asterisk_Star.png",
    projectileScale: 0.1,
    projectileStartOffsetX: 50,
    hitSrc: "./sounds/projectile-hit/asterisk-hit.mp3",
  },

  // Comma Chameleon (tongue)
  {
    heroImage: "./images/CC1.png",
    secondHeroImage: "./images/cc.png",
    heroScale: 0.5,
    symbol: "Comma Chameleon ,",
    color: "pink",
    projectileImage: null,
    projectileScale: 0.2,
    projectileStartOffsetX: 70,
    shootSrc: "./sounds/lick.mp3",
    useTongue: true,
  },

  // HashTagger (tongue/paint)
  {
    heroImage: "./images/Octo.png",
    secondHeroImage: "./images/Octo2.png",
    heroScale: 0.5,
    symbol: "HashTagger #",
    color: "turquoise",
    projectileImage: null,
    projectileScale: 0.1,
    projectileStartOffsetX: 110,
    shootSrc: "./sounds/spray_paint.mp3",
    useTongue: true,
  },

  // Ms. Hyphen
  {
    heroImage: "./images/Hyphenol_1.png",
    secondHeroImage: "./images/Hyphenol_2.png",
    heroScale: 0.6,
    symbol: "Ms. Hyphen -",
    color: "turquoise",
    projectileImage: "./images/Flask.png",
    projectileScale: 0.25,
    projectileStartOffsetX: 118,
    shootSrc: "./sounds/whoosh.mp3",
  },

  // Sergeant Colon
  {
    heroImage: "./images/Colon1.png",
    secondHeroImage: "./images/Colon.png",
    heroScale: 0.9,
    symbol: "Sergeant Colon :",
    color: "brown",
    projectileImage: "./images/Colon_Wave.png",
    projectileScale: 0.1,
    projectileStartOffsetX: 126,
  },

  // Semicolonel
  {
    heroImage: "./images/Semicolonel-profile.png",
    secondHeroImage: "white",
    heroScale: 0.9,
    symbol: "Semicolonel ;",
    color: "orange",
    projectileImage: "./images/Semicolonel.png",
    projectileScale: 0.5,
    projectileStartOffsetX: 100,
  },

  // Apostrophantom
  {
    heroImage: "./images/Apostrophantom.png",
    secondHeroImage: "white",
    heroScale: 0.8,
    symbol: "Apostrophantom '",
    color: "purple",
    projectileImage: "./images/Ectoplasm.png",
    projectileScale: 0.2,
    projectileStartOffsetX: 118,
    shootSrc: "./sounds/spirit-sound.mp3",
  },

  // Article
  {
    heroImage: "./images/Article.png",
    secondHeroImage: "./images/Article2.png",
    heroScale: 0.4,
    symbol: "Art The Tickler (Article)",
    color: "black",
    projectileImage: "./images/Ectoplasm.png",
    projectileScale: 0.2,
    projectileStartOffsetX: 118,
    shootSrc: "./sounds/featherSwish.mp3",
    hitSrc: "./sounds/article-laughing.mp3",
  },

  // Betar
  {
    heroImage: "./images/Betar_1.png",
    secondHeroImage: "./images/Betar_2.png",
    heroScale: 0.4,
    symbol: "Betar (Alphabet Neighbors)",
    color: "gray",
    projectileImage: "./images/Ectoplasm.png",
    projectileScale: 0.2,
    projectileStartOffsetX: 118,
    shootSrc: "./sounds/featherSwish.mp3",
  },

  // Ambigrambador
  {
    heroImage: "./images/Ambigram.png",
    secondHeroImage: "./images/Ambigram2.png",
    heroScale: 0.3,
    symbol: "Ambigrambador",
    color: "violet",
    projectileImage: "./images/Colon_Wave.png",
    projectileScale: 0.1,
    projectileStartOffsetX: 118,
  },

  // The Foon
  {
    heroImage: "./images/Foon_.png",
    secondHeroImage: "./images/Foon_2.png",
    heroScale: 0.35,
    symbol: "The Foon (Spoonerism)",
    color: "green",
    projectileImage: "./images/Foon_Projectile.png",
    projectileScale: 0.1,
    projectileStartOffsetX: 70,
    shootSrc: "./sounds/whoosh.mp3",
    hitSrc: "./sounds/foon_hit.mp3",
  },

  // Phonia
  {
    heroImage: "./images/Phonia.png",
    secondHeroImage: "./images/Phonia2.png",
    heroScale: 0.3,
    symbol: "Phonia (Homophones)",
    color: "seagreen",
    projectileImage: "./images/Bubble.png",
    projectileScale: 0.1,
    projectileStartOffsetX: 100,
    shootSrc: "./sounds/bubble.mp3",
    hitSrc: "./sounds/projectile-hit/bubble-hit.mp3",
  },

  // Parents of the Seas
  {
    heroImage: "./images/Parents.png",
    secondHeroImage: undefined,
    heroScale: 0.35,
    symbol: "Parents of the Seas ( )",
    color: "lightblue",
    projectileImage: "./images/Bubble.png",
    projectileScale: 0.1,
    projectileStartOffsetX: 50,
    shootSrc: "./sounds/bubble.mp3",
    hitSrc: "./sounds/projectile-hit/bubble-hit.mp3",
  },

  // QuetzalQuotel
  {
    heroImage: "./images/Qq_2.png",
    secondHeroImage: "./images/Qq.png",
    heroScale: 0.7,
    symbol: "QuetzalQuotel",
    color: "green",
    projectileImage: "./images/Feather.png",
    projectileScale: 0.1,
    projectileStartOffsetX: 126,
    shootSrc: "./sounds/wings.mp3",
  },

  // Roundabout
  {
    heroImage: "./images/Roundabout1.png",
    secondHeroImage: "./images/Roundabout2.png",
    heroScale: 0.4,
    symbol: "Roundabout",
    color: "cyan",
    projectileImage: "./images/Colon_Wave.png",
    projectileScale: 0.2,
    projectileStartOffsetX: 80,
  },

  // Space-el
  {
    heroImage: "./images/Spacel.png",
    secondHeroImage: "./images/Spacel2.png",
    heroScale: 0.5,
    symbol: "Space-el",
    color: "violet",
    projectileImage: "./images/Colon_Wave.png",
    projectileScale: 0.1,
    projectileStartOffsetX: 126,
    shootSrc: "./sounds/523467__tv_ling__perfect-fart.mp3",
  },

  // Sir Dele of Dallying
  {
    heroImage: "./images/Whiteknight1.png",
    secondHeroImage: "./images/Whiteknight2.png",
    heroScale: 0.5,
    symbol: "Sir Dele of Dallying",
    color: "brown",
    projectileImage: "images/Colon_Wave.png",
    projectileScale: 0.2,
    projectileStartOffsetX: 80,
  },

  // Zana
  {
    heroImage: "./images/Zana.png",
    secondHeroImage: "./images/Zana2.png",
    heroScale: 0.5,
    symbol: "Zana (caret)",
    color: "whitesmoke",
    projectileImage: "images/Caret.png",
    projectileScale: 0.05,
    projectileStartOffsetX: 80,
  },
];

/* ---------- Game State ---------- */

let hero = null;
let projectile = null;

const STATE = {
  words: [],
  current: "",
  buffer: "",
  score: 0,
  streak: 0,
  count: 0,
  wordY: 50,
  bufferY: 100,
  paused: false,
  canShoot: false,
  shortcutPending: false, // set right after a long word is typed correctly
  shortcutActive: false, // true while we’re teaching copy/paste
  shortcut: { copied: false, pasteCount: 0, slots: 2 },
  savedCount: 0,
  savedWords: new Set(), // fallback store
  saveHandle: null, // File System Access API handle (when available)
  advanceLock: false, // (from your earlier fix)
  lessonWord: "", // (from your earlier fix)
};

async function loadWords() {
  try {
    const txt = await fetch("./2of12.txt", { cache: "no-store" }).then((r) =>
      r.text()
    );
    STATE.words = txt
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    STATE.words = [
      "punctuate",
      "syntax",
      "vector",
      "pixel",
      "palindrome",
      "grammar",
      "oracle",
    ];
  }
}

function chooseHero() {
  const spec = HEROES[(Math.random() * HEROES.length) | 0];

  hero = new Hero(spec);

  const nameEl = document.getElementById("tg-hero-name");
  if (nameEl) nameEl.textContent = spec.symbol || "";

  hero.vanishOnShoot = spec.secondHeroImage === "white";

  HERO_NAME_EL.textContent = spec.symbol || "";
  // re-center once the first frame has sized
  setTimeout(() => hero?.centerBottom(), 0);
}

async function restoreSavedHandle() {
  try {
    const h = await idbGet("vocabHandle");
    if (!h) return;
    // Ensure we have permission
    const q = await h.queryPermission({ mode: "readwrite" });
    if (q === "granted") {
      STATE.saveHandle = h;
      return;
    }
    if (q !== "denied") {
      const p = await h.requestPermission({ mode: "readwrite" });
      if (p === "granted") STATE.saveHandle = h;
    }
  } catch (e) {
    console.warn("restoreSavedHandle failed:", e);
  }
}

function updateSavedHUD() {
  const el = document.getElementById("tg-saved-count");
  if (el) el.textContent = STATE.savedCount;
}

// Fallback: rebuild a Blob URL for download link
function refreshVocabDownloadLink() {
  const link = document.getElementById("tg-vocab-download");
  if (!link) return;
  // If we’re using FS Access API, keep this hidden
  if (STATE.saveHandle) {
    link.classList.add("tg-hidden");
    return;
  }

  const words = Array.from(STATE.savedWords);
  if (words.length === 0) {
    link.classList.add("tg-hidden");
    return;
  }

  const blob = new Blob([words.join("\n") + "\n"], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.classList.remove("tg-hidden");

  // Clean previous object URL on rebuild
  if (link.dataset.url) URL.revokeObjectURL(link.dataset.url);
  link.dataset.url = url;
}

async function saveCurrentWord() {
  // Pick the word to save (locked during the lesson)
  const word = (STATE.shortcutActive ? STATE.lessonWord : STATE.current) || "";
  const w = word.trim();
  if (!w) return;

  // --- tiny IndexedDB helpers (scoped here so you don’t need extra globals) ---
  const IDB_DB = "tg-vocab";
  const IDB_STORE = "handles";

  function idbOpen() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  function idbGet(key) {
    return idbOpen().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE, "readonly");
          const store = tx.objectStore(IDB_STORE);
          const r = store.get(key);
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        })
    );
  }
  function idbSet(key, val) {
    return idbOpen().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE, "readwrite");
          const store = tx.objectStore(IDB_STORE);
          const r = store.put(val, key);
          r.onsuccess = () => resolve();
          r.onerror = () => reject(r.error);
        })
    );
  }
  function idbDel(key) {
    return idbOpen().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(IDB_STORE, "readwrite");
          const store = tx.objectStore(IDB_STORE);
          const r = store.delete(key);
          r.onsuccess = () => resolve();
          r.onerror = () => reject(r.error);
        })
    );
  }

  async function appendLine(handle, line) {
    // Ensure permission
    try {
      const q = await handle.queryPermission?.({ mode: "readwrite" });
      if (q !== "granted") {
        const p = await handle.requestPermission?.({ mode: "readwrite" });
        if (p !== "granted") throw new Error("permission denied");
      }
    } catch (_) {
      // Some Chrome builds don’t support queryPermission; continue to try writing.
    }

    // Append at EOF
    const file = await handle.getFile();
    const writable = await handle.createWritable({ keepExistingData: true });
    await writable.seek(file.size);
    await writable.write(line + "\n");
    await writable.close();
  }

  // --- Preferred path: File System Access API (Chrome/Edge) ---
  if ("showSaveFilePicker" in window) {
    try {
      // If we don’t have a handle this session, try to restore from IDB
      if (!STATE.saveHandle) {
        try {
          const restored = await idbGet("vocabHandle");
          if (restored) STATE.saveHandle = restored;
        } catch (e) {
          // ignore restore failures
        }
      }

      // If still no handle, prompt once and remember it
      if (!STATE.saveHandle) {
        const handle = await window.showSaveFilePicker({
          suggestedName: "vocabulary.txt",
          types: [
            { description: "Text File", accept: { "text/plain": [".txt"] } },
          ],
        });
        STATE.saveHandle = handle;
        try {
          await idbSet("vocabHandle", handle);
        } catch (e) {}
      }

      // Append
      try {
        await appendLine(STATE.saveHandle, w);
      } catch (err) {
        // If append fails (file moved/perms changed), re-prompt once
        console.warn("Append failed; re-prompting Save As…", err);
        try {
          await idbDel("vocabHandle");
        } catch (e) {}
        STATE.saveHandle = await window.showSaveFilePicker({
          suggestedName: "vocabulary.txt",
          types: [
            { description: "Text File", accept: { "text/plain": [".txt"] } },
          ],
        });
        try {
          await idbSet("vocabHandle", STATE.saveHandle);
        } catch (e) {}
        await appendLine(STATE.saveHandle, w);
      }

      // HUD + SFX
      STATE.savedCount += 1;
      if (typeof updateSavedHUD === "function") updateSavedHUD();
      try {
        saveSfx?.play?.();
        showSavedToast();
      } catch {}
      return;
    } catch (err) {
      // User canceled or API not usable → fall through to fallback
      console.warn("Save picker error or canceled; using fallback:", err);
    }
  }

  // --- Fallback path: accumulate in memory + offer download link ---
  if (!STATE.savedWords.has(w)) {
    STATE.savedWords.add(w);
    STATE.savedCount += 1;
    if (typeof updateSavedHUD === "function") updateSavedHUD();
    if (typeof refreshVocabDownloadLink === "function")
      refreshVocabDownloadLink();
    try {
      saveSfx?.play?.();
    } catch {}
  }
}

function showSavedToast() {
  const el = document.getElementById("tg-saved");
  if (!el) return;
  el.classList.remove("tg-hidden", "tg-saved--anim");
  void el.offsetWidth; // restart animation
  el.classList.add("tg-saved--anim");
  try {
    saveSfx.play();
  } catch {}
  setTimeout(() => {
    el.classList.add("tg-hidden");
    el.classList.remove("tg-saved--anim");
  }, 700);
}

function showCopiedToast() {
  const el = document.getElementById("tg-copied");
  if (!el) return;

  // reset animation if it just ran
  el.classList.remove("tg-hidden", "tg-copied--anim");
  // force reflow so the animation restarts
  void el.offsetWidth;
  el.classList.add("tg-copied--anim");

  // sound!
  try {
    copySfx.play();
  } catch {}

  // hide after animation
  setTimeout(() => {
    el.classList.add("tg-hidden");
    el.classList.remove("tg-copied--anim");
  }, 700);
}

function startShortcutLesson() {
  STATE.shortcutActive = true;
  STATE.shortcut.copied = false;
  STATE.shortcut.pasteCount = 0;
  const box = document.getElementById("tg-shortcut");
  box && box.classList.remove("tg-hidden");
}

function endShortcutLesson() {
  STATE.shortcutActive = false;
  const box = document.getElementById("tg-shortcut");
  box && box.classList.add("tg-hidden");
  nextWord();
}

function nextWord() {
  STATE.current = STATE.words[(Math.random() * STATE.words.length) | 0];
  STATE.buffer = "";
  HUD.count.textContent = ++STATE.count;
  STATE.canShoot = true;
}

function drawWordAndBuffer() {
  const cx = CANVAS.clientWidth / 2;
  CTX.save();
  CTX.fillStyle = "#111";
  CTX.textAlign = "center";
  CTX.textBaseline = "middle";
  CTX.font = "700 48px Palanquin, sans-serif";
  CTX.fillText(STATE.current, cx, STATE.wordY);
  CTX.font = "600 26px Palanquin, sans-serif";
  CTX.globalAlpha = 0.9;
  CTX.fillText(STATE.buffer || "…", cx, STATE.bufferY);
  CTX.globalAlpha = 1;
  CTX.restore();
}

function drawShortcutSlots() {
  if (!STATE.shortcutActive) return;

  const cx = CANVAS.clientWidth / 2;
  const y1 = STATE.wordY + 70;
  const y2 = STATE.wordY + 120;

  CTX.save();
  CTX.strokeStyle = "#444";
  CTX.lineWidth = 2;

  // slot 1 frame
  CTX.strokeRect(cx - 140, y1 - 22, 280, 44);
  if (STATE.shortcut.pasteCount >= 1) {
    CTX.fillStyle = "#111";
    CTX.textAlign = "center";
    CTX.textBaseline = "middle";
    CTX.font = "700 32px Palanquin, sans-serif";
    CTX.fillText(STATE.current, cx, y1);
  }

  // slot 2 frame
  CTX.strokeRect(cx - 140, y2 - 22, 280, 44);
  if (STATE.shortcut.pasteCount >= 2) {
    CTX.fillStyle = "#111";
    CTX.textAlign = "center";
    CTX.textBaseline = "middle";
    CTX.font = "700 32px Palanquin, sans-serif";
    CTX.fillText(STATE.current, cx, y2);
  }

  const w = STATE.shortcutActive ? STATE.lessonWord : STATE.current;

  // slot 1
  if (STATE.shortcut.pasteCount >= 1) {
    CTX.fillText(w, cx, y1);
  }
  // slot 2
  if (STATE.shortcut.pasteCount >= 2) {
    CTX.fillText(w, cx, y2);
  }

  CTX.restore();
}

function flashHit() {
  CTX.save();
  CTX.fillStyle = "rgba(156,255,180,0.25)";
  CTX.fillRect(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);
  CTX.restore();
}

function update() {
  CTX.fillStyle = "#fff";
  CTX.fillRect(0, 0, CANVAS.clientWidth, CANVAS.clientHeight);

  drawWordAndBuffer();
  drawShortcutSlots();

  // second-sprite during shot
  if (hero) {
    const hideNow = Boolean(projectile && hero.vanishOnShoot);
    if (!hideNow) {
      hero.drawSecondFrame = Boolean(projectile && hero.image2);
      hero.draw();
    }
  }

  if (projectile) {
    projectile.update();
    projectile.draw();
    const projTop =
      projectile instanceof CommaTongue
        ? projectile.y - projectile.h
        : projectile.y;
    if (projTop <= STATE.wordY) {
      if (!STATE.advanceLock) {
        STATE.advanceLock = true; // << prevent double-advance
        projectile.vy = 0;
        hero?.hitSound();
        flashHit();

        setTimeout(() => {
          projectile = null;
        }, 60);
        setTimeout(() => {
          if (STATE.shortcutPending) {
            STATE.shortcutPending = false;
            startShortcutLesson(); // << do NOT change STATE.current here
            STATE.advanceLock = false; // lesson is active; allow future advance
          } else {
            nextWord(); // normal flow
            STATE.advanceLock = false;
          }
        }, 180);
      }
    } else if (projTop <= -40) {
      projectile = null;
    }
  }

  if (!STATE.paused) requestAnimationFrame(update);
}

function submitBuffer() {
  const typed = STATE.buffer.trim();
  STATE.buffer = "";
  if (!typed || !STATE.canShoot) return;

  const isLong = STATE.current.length >= 9;
  if (isLong) {
    STATE.shortcutPending = true;
    STATE.lessonWord = STATE.current; // lock the exact word we just typed
  }

  if (typed.toLowerCase() === STATE.current.toLowerCase()) {
    STATE.score += 10 + STATE.streak * 2;
    STATE.streak += 1;
    HUD.score.textContent = STATE.score;
    HUD.streak.textContent = STATE.streak;

    hero?.shootSound();
    projectile = hero?.useTongue ? new CommaTongue(hero) : new Projectile(hero);
    STATE.canShoot = false;
  } else {
    STATE.streak = 0;
    HUD.streak.textContent = STATE.streak;
  }
}

/* ---------- Input (typing only) ---------- */

window.addEventListener(
  "keydown",
  (e) => {
    const printable =
      e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

    // If onboarding dialog is open, let the browser handle Enter/Esc; don't intercept
    const _dlg = document.getElementById("tg-onboard");
    if (_dlg && _dlg.open) {
      return;
    }

    if (STATE.shortcutActive) {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      if (mod && key === "c") {
        STATE.shortcut.copied = true;
        showCopiedToast(); // << add this line
        return;
      }
      if (mod && key === "v" && STATE.shortcut.copied) {
        if (STATE.shortcut.pasteCount < STATE.shortcut.slots) {
          STATE.shortcut.pasteCount += 1;
          if (STATE.shortcut.pasteCount >= STATE.shortcut.slots) {
            // Small delay so they see the second paste appear
            setTimeout(endShortcutLesson, 250);
          }
        }
        return;
      }

      // While in the lesson, ignore normal typing keys
      return;
    }

    // Ctrl/⌘ + S — save current/lesson word
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      e.stopPropagation();
      saveCurrentWord();
      return;
    }

    if (
      printable ||
      e.key === "Backspace" ||
      e.key === " " ||
      e.key === "Enter" ||
      e.key === "Escape"
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (printable) {
      STATE.buffer += e.key;
      return;
    }
    if (e.key === "Backspace") {
      STATE.buffer = STATE.buffer.slice(0, -1);
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      submitBuffer();
      return;
    }
    if (e.key === "Escape") {
      STATE.paused = !STATE.paused;
      if (!STATE.paused) requestAnimationFrame(update);
    }
  },
  true
);

/* ---------- Boot ---------- */

(async function boot() {
  await loadWords();
  await restoreSavedHandle();
  chooseHero();
  nextWord();
  requestAnimationFrame(update);
})();
