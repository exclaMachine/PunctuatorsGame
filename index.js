import { addSpansAndIds } from "./utils/utils.js";
import { addSpansAndIdsForWordPlay } from "./utils/utils.js";
import { waitForElement } from "./utils/utils.js";
import { nodeArr, numberOfPunctuationArray } from "./utils/utils.js";
import { heroToTheRescue } from "./utils/utils.js";
import { setClassName } from "./utils/utils.js";
import { createRandomMadLibSentence } from "./SentenceFunc.js";
import {
  shortenContraction,
  secondContractionWordSet,
} from "./utils/contractionFunc.js";
import { textRevealSpeeds, changeTextToSpeechBubble } from "./speechbubble.js";
import { shakeAndBorderizeArticle } from "./articleFunc.js";
import { makeAmbigram } from "./AmbigramFunc.js";
//import { swapWord } from "./spoonerismFunc.js";
const canvas = document.getElementById("background");
const c = canvas.getContext("2d");
// const period = document.getElementById("first");

let root = document.documentElement;

let CREATE_SENTENCE_COUNT = 1;
let SWITCH_CASE_NUMBER = 2;
let ENDING_REACHED = false;
const PUNC_REGEX = /[\'\".,\/#!$%\^&\*;:{}?=\-_`~()\‘\’\“\”]/g;
let speechContainer = document.querySelector(".speech-bubble");

let speechLineForWin = [
  {
    string: "You found all the punctuation and capital letters!!",
    speed: textRevealSpeeds.fast,
  },
  // {
  //   string: "Refresh the page to play again!",
  //   speed: textRevealSpeeds.fast,
  //   classes: ["green"],
  // },
];

let previousElement = null;
let isAnimating = false; // Add a flag to check if the animation is currently in progress

const errorMessage = document.getElementById("error-message");
const characterCount = document.getElementById("character-count");
const initialTypedSentence = document.getElementById("input-sentence");
const removePuncButton = document.getElementById("punc-button");
const createSentenceButton = document.getElementById("create-sentence-button");
const out1 = document.getElementById("output");
const footer = document.getElementById("footer");
const start = document.getElementById("start");
const startBanner = document.getElementById("banner");

const wordPlayOptions = document.getElementById("wordPlayOptions");
//const doWordPlayButton = document.querySelector(".create-wordplay-button");

const endingMessage1 = document.getElementById("ending_message_1");
const refreshButton = document.querySelector(".refresh-game-btn");

const characterControls = document.getElementById("control-buttons");
const shootButton = document.getElementById("shoot-button");
const leftButton = document.getElementById("left-button");
const switchButton = document.getElementById("switch-button");
const rightButton = document.getElementById("right-button");
const nameTag = document.getElementById("name-tag");
const hintButton = document.getElementById("hint-button");
const footNote = document.querySelector("#footnote");

//https://www.youtube.com/watch?v=MBaw_6cPmAw
const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

function spinLetter(letterSpan, fromChar, toChar, callback) {
  // Clean any previous content
  letterSpan.innerHTML = "";

  const reel = document.createElement("div");
  reel.className = "reel";

  const neighbors = getAlphabetNeighbors(fromChar);

  for (let ch of neighbors) {
    const face = document.createElement("span");
    face.textContent = ch;
    reel.appendChild(face);
  }

  letterSpan.appendChild(reel);

  setTimeout(() => {
    letterSpan.textContent = toChar;
    if (callback) callback();
  }, 900);
}

function getAlphabetNeighbors(letter) {
  const code = letter.charCodeAt(0);
  return [
    String.fromCharCode(code === 122 ? 97 : code + 1), // next
    letter,
    String.fromCharCode(code === 97 ? 122 : code - 1), // previous
  ];
}

const buttonSounds = {
  clicky: new Howl({
    src: ["./sounds/click.mp3"],
  }),
};

refreshButton.addEventListener("click", () => {
  refreshButton.classList.add("go-away");
  location.reload();
});

//Might be able to use Intersection Observer to make this more efficient
// console.log("per", period.getBoundingClientRect());

//number accounts for the padding and height of the inputs. Need to fix for when that goes away
canvas.width = innerWidth - 4;
canvas.height = innerHeight - 50;

//When the sentence is first loaded it shows the team. We set this to True and then any button pressed will just bring up first character
let bRightAfterSentenceIsLoaded = false;
let dropDownSelection = "";

removePuncButton.addEventListener("click", () => {
  buttonSounds.clicky.play();
  if (!initialTypedSentence.value) {
    return (errorMessage.innerText = "Field cannot be blank");
  }

  // Hide Typing Game link once main game starts
  const typingLink = document.getElementById("typing-game-link");

  let selectedOption = wordPlayOptions.value;
  dropDownSelection = selectedOption;
  if (selectedOption === "removePunc") {
    if (!PUNC_REGEX.test(initialTypedSentence.value)) {
      return (errorMessage.innerText = "Sentence must have punctuation!");
    }
    let punctuated = addSpansAndIds(initialTypedSentence.value, out1);
  } else {
    addSpansAndIdsForWordPlay(initialTypedSentence.value, out1, selectedOption);
  }
  mySong.stop();
  setClassName(
    "go-away",
    initialTypedSentence,
    removePuncButton,
    startBanner,
    wordPlayOptions,
    typingLink
  );

  if (dropDownSelection === "alphabetNeighbors") {
    updateCharacterModal("alphabetNeighbors");
  }
  // else if (dropDownSelection === "rounded") {
  //   updateCharacterModal("rounded");
  // }

  setClassName("grid-container", characterControls);

  errorMessage.innerText = "";
  bRightAfterSentenceIsLoaded = true;
});

//const modal = document.querySelector(button.dataset.modalTarget);

function updateCharacterModal(selection) {
  const templates = {
    alphabetNeighbors: `
    <div class="char-modal">
      <h2>Betar — Alphabet Neighbors</h2>
      <p class="lead">
        An alphabet neighbor is the letter directly before or after a letter in the alphabet
        (with wrap-around: <code>a</code> ↔ <code>z</code>). Betar spins one letter to a neighbor
        to form a real word.
      </p>

      <div class="example">
        <div>Start</div><code>timer</code>
        <div>Hit #1</div><code>tiler</code><small>(m → l)</small>
      </div>

      <ul class="tips">
        <li>Only one letter changes per hit.</li>
        <li>Neighbors wrap: <code>a</code> ↔ <code>z</code>.</li>
        <li>Words alternate: original → neighbor → original → next neighbor…</li>
      </ul>
    </div>
  `,
  };

  modal.innerHTML =
    templates[selection] ??
    `
  <div class="char-modal">
    <h2>Character Info</h2>
    <p class="lead">Details for this character will appear here.</p>
  </div>
`;
}

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    buttonSounds.clicky.play();
    const modal = document.querySelector(button.dataset.modalTarget);
    // if (dropDownSelection === "alphabetNeighbors") {
    //   console.log("alph");
    //   modal.innerHTML =
    //     "An alphabet neighbor is the letter that is next to that letter in the alphabet. Betar uses this power to create new words";
    // }
    openModal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

let openModal = (modal) => {
  if (modal === null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
};

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});

let closeModal = (modal) => {
  if (modal === null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
};

//TODO Make a button to do alphabet work similar to addSpansAndIdsForWordPlay

//TODO incorporate when more self-made sentences are made. The too variables don't work if game restart involves refresh
// createSentenceButton.addEventListener("click", () => {
//   if (CREATE_SENTENCE_COUNT === SWITCH_CASE_NUMBER) CREATE_SENTENCE_COUNT = 1;

//   addSpansAndIds(
//     createRandomMadLibSentence(CREATE_SENTENCE_COUNT),
//     out1,
//   );

// setClassName("go-away", startBanner, createSentenceButton);
// setClassName("grid-container", characterControls);
// });

const gameSfx = {
  end: new Howl({
    src: ["./sounds/success-fanfare-trumpets.mp3"],
  }),
};

let mySong = new Howl({
  src: ["./sounds/FourNote.mp3"],
  autoplay: false, // or true, if you want it to play automatically
  loop: true, // if you want the song to loop
  volume: 0.5,
});

class Hero {
  /**
   * Creates a new Hero.
   * @param {string} heroImage - The image of the hero.
   * @param {number} heroScale - The scale of the hero image.
   * @param {string} symbol - The symbol for the hero.
   * @param {string} characterColor - The color of the character's text.
   * @param {number} projectileStartPositionX - The starting position X of the projectile.
   * @param {number} projectileLength - The length of the projectile.
   * @param {string} projectileImage - The image for the projectile.
   * @param {string} projectileShootSound - The sound when the projectile is shot.
   * @param {number} projectileScale - The scale of the projectile image.
   * @param {number} [projectileSoundRate] - The rate of the projectile sound.
   * @param {number} [projectileSoundVolume] - The volume of the projectile sound.
   * @param {string} [secondHeroImage] - The second image of the hero.
   * @param {string} projectileHitSound - The sound when the projectile hits.
   */

  constructor(
    heroImage,
    heroScale,
    symbol,
    characterColor,
    projectileStartPositionX,
    projectileLength,
    projectileImage,
    projectileShootSound,
    projectileScale,
    projectileSoundRate,
    projectileSoundVolume,
    secondHeroImage,
    projectileHitSound
  ) {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.heroImage = heroImage;
    this.heroScale = heroScale;
    this.characterColor = characterColor;
    this.symbol = symbol;
    this.projectileStartPositionX = projectileStartPositionX;
    this.projectileLength = projectileLength;
    this.projectileImage = projectileImage;
    this.projectileShootSound = projectileShootSound;
    this.projectileScale = projectileScale;
    this.projectileSoundRate = projectileSoundRate;
    this.projectileSoundVolume = projectileSoundVolume;
    this.secondHeroImage = secondHeroImage;
    this.projectileHitSound = projectileHitSound;

    this.sfx = {
      shoot: new Howl({
        src: [this.projectileShootSound],
        rate: this.projectileSoundRate,
      }),
      hit: new Howl({
        src: [this.projectileHitSound],
      }),
    };

    //should put these in an array
    const image = new Image();
    const image2 = new Image();

    image.src = this.heroImage;
    image.onload = () => {
      this.image = image;
      this.width = image.width * heroScale;
      this.height = image.height * heroScale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height + 20,
      };
    };

    if (this.heroImage === "white") {
      image2.fillStyle = "white";
      image2.fillRect(
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    } else {
      image2.src = this.secondHeroImage;
      image2.onload = () => {
        this.image2 = image2;
        this.width = image2.width * heroScale;
        this.height = image2.height * heroScale;
        this.position = {
          x: canvas.width / 2 - this.width / 2,
          y: canvas.height - this.height + 20,
        };
      };
    }
  }

  shootProjectileSound() {
    this.sfx.shoot.play();
  }

  hitProjectileSound() {
    this.sfx.hit.play();
  }

  draw() {
    c.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  draw2() {
    c.save();
    c.drawImage(
      this.image2,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    c.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  update2() {
    if (this.image2) {
      this.draw2();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
}

//create a function that makes him disappear when projectile shoots
class Ambigrambador extends Hero {
  constructor() {
    super(
      "./images/Ambigram.png",
      0.3,
      "Ambigrambador",
      "violet",
      118,
      50,
      "./images/Colon_Wave.png",
      undefined,
      0.1,
      5.0,
      undefined,
      "./images/Ambigram2.png"
    );
  }
}

class AnacontractShine extends Hero {
  constructor() {
    super(
      "./images/AnacontractshineEat2.png",
      0.3,
      "ApostroPharaoh (Contraction)",
      "lightgreen",
      118,
      50,
      "./images/AnacontractshineEat3.png",
      undefined,
      0.2,
      5.0,
      undefined,
      "white",
      "./sounds/projectile-hit/ana-eat.mp3"
    );
  }
}

class Apostrophantom extends Hero {
  constructor() {
    super(
      "./images/Apostrophantom.png",
      0.8,
      "Apostrophantom '",
      "purple",
      118,
      50,
      "./images/Ectoplasm.png",
      "./sounds/spirit-sound.mp3",
      0.2,
      5.0,
      undefined,
      "white"
    );
  }
}

class ArtTheTickler extends Hero {
  constructor() {
    super(
      "./images/Article.png",
      0.4,
      "Art The Tickler (Article)",
      "black",
      118,
      50,
      "./images/Ectoplasm.png",
      "./sounds/featherSwish.mp3",
      0.2,
      undefined,
      undefined,
      "./images/Article2.png",
      "./sounds/article-laughing.mp3"
    );
  }
}

class Betar extends Hero {
  constructor() {
    super(
      "./images/Betar_1.png",
      0.4,
      "Betar (Alphabet Neighbors)",
      "gray",
      118,
      50,
      "./images/Ectoplasm.png",
      "./sounds/featherSwish.mp3",
      0.2,
      undefined,
      undefined,
      "./images/Betar_2.png"
    );
  }
}

class CommaChameleon extends Hero {
  constructor(projectileLength) {
    super(
      "./images/CC1.png",
      0.5,
      "Comma Chameleon ,",
      "pink",
      70,
      projectileLength,
      undefined,
      "./sounds/lick.mp3",
      0.2,
      undefined,
      undefined,
      "./images/cc.png"
    );
  }
}

class OctoThwarter extends Hero {
  constructor(projectileLength) {
    super(
      "./images/Octo.png",
      0.5,
      "HashTagger #",
      "turquoise",
      110,
      projectileLength,
      undefined,
      "./sounds/spray_paint.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Octo2.png"
    );
  }
}

class DrHyphenol extends Hero {
  constructor() {
    super(
      "./images/Hyphenol_1.png",
      0.6,
      "Ms. Hyphen -",
      "turquoise",
      118,
      50,
      "./images/Flask.png",
      "./sounds/whoosh.mp3",
      0.25,
      undefined,
      undefined,
      "./images/Hyphenol_2.png"
    );
  }
}

class ExclaMachine extends Hero {
  constructor() {
    super(
      "./images/EM.png",
      0.6,
      "Excla Machine !",
      "yellow",
      118,
      50,
      "./images/EM_Belt.png",
      "./sounds/whoosh.mp3",
      0.5,
      undefined,
      undefined,
      "./images/EM_Belt2.png"
    );
  }
}

class Foon extends Hero {
  constructor() {
    super(
      "./images/Foon_.png",
      0.35,
      "The Foon (Spoonerism)",
      "green",
      70,
      50,
      "./images/Foon_Projectile.png",
      "./sounds/whoosh.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Foon_2.png",
      "./sounds/foon_hit.mp3"
    );
  }
}

class FullStop extends Hero {
  constructor() {
    super(
      "./images/fs.png",
      0.5,
      "Full Stop .",
      "red",
      110,
      50,
      "./images/Laser.png",
      "./sounds/laser-bolt.mp3",
      0.2,
      undefined,
      undefined,
      undefined,
      "./sounds/projectile-hit/laser-hit.mp3"
    );
  }
}

class FullStopGrenade extends Hero {
  constructor() {
    super(
      "./images/FS_capital1.png",
      0.5,
      "Full Stop (Capitalize)",
      "red",
      110,
      50,
      "./images/Grenade.png",
      "./sounds/whoosh.mp3",
      0.2,
      undefined,
      undefined,
      "./images/FS_capital2.png"
    );
  }
}

class MasterAsterisk extends Hero {
  constructor() {
    super(
      "./images/Asterisk.png",
      0.35,
      "Master Asterisk *",
      "gold",
      50,
      50,
      "./images/Asterisk_Star.png",
      undefined,
      0.1,
      1,
      undefined,
      "./images/Asterisk2.png",
      "./sounds/projectile-hit/asterisk-hit.mp3"
    );
  }
}

class ParentsOfTheSeas extends Hero {
  constructor() {
    super(
      "./images/Parents.png",
      0.35,
      "Parents of the Seas ( )",
      "lightblue",
      50,
      50,
      "./images/Bubble.png",
      "./sounds/bubble.mp3",
      0.1,
      undefined,
      undefined,
      undefined,
      "./sounds/projectile-hit/bubble-hit.mp3"
    );
  }
}

class Phonia extends Hero {
  constructor() {
    super(
      "./images/Phonia.png",
      0.3,
      "Phonia (Homophones)",
      "seagreen",
      100,
      50,
      "./images/Bubble.png",
      "./sounds/bubble.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Phonia2.png",
      "./sounds/projectile-hit/bubble-hit.mp3"
    );
  }
}

class QuestionMarkswoman extends Hero {
  constructor() {
    super(
      "./images/qm.png",
      0.7,
      "Question Markswoman ?",
      "blue",
      126,
      50,
      "./images/Arrow.png",
      "./sounds/arrow-shot.mp3",
      0.2,
      undefined,
      undefined,
      "./images/QM2.png"
    );
  }
}

//need to fix with code or choose different font so we get smart quotes instead of dumb quotes https://www.fontshop.com/content/curly-quotes
class QuetzalQuotel extends Hero {
  constructor() {
    super(
      "./images/Qq_2.png",
      0.7,
      "QuetzalQuotel",
      "green",
      126,
      50,
      "./images/Feather.png",
      "./sounds/wings.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Qq.png"
    );
  }
}

class Roundabout extends Hero {
  constructor() {
    super(
      "./images/Roundabout1.png",
      0.4,
      "Roundabout",
      "cyan",
      80,
      50,
      "./images/Colon_Wave.png",
      undefined,
      0.2,
      undefined,
      undefined,
      "./images/Roundabout2.png"
    );
  }
}

class SargeColon extends Hero {
  constructor() {
    super(
      "./images/Colon1.png",
      0.9,
      "Sergeant Colon :",
      "brown",
      126,
      50,
      "./images/Colon_Wave.png",
      undefined,
      0.1,
      undefined,
      undefined,
      "./images/Colon.png"
    );
  }
}

class SemiColonel extends Hero {
  constructor() {
    super(
      "./images/Semicolonel-profile.png",
      0.9,
      "Semicolonel ;",
      "orange",
      100,
      50,
      "./images/Semicolonel.png",
      undefined,
      0.5,
      undefined,
      undefined,
      "white"
    );
  }
}

class Spacel extends Hero {
  constructor() {
    super(
      "./images/Spacel.png",
      0.5,
      "Space-el",
      "violet",
      126,
      50,
      "./images/Colon_Wave.png",
      "./sounds/523467__tv_ling__perfect-fart.mp3",
      0.1,
      undefined,
      undefined,
      "./images/Spacel2.png"
    );
  }
}

class WhiteKnight extends Hero {
  constructor() {
    super(
      "./images/Whiteknight1.png",
      0.5,
      "Sir Dele of Dallying",
      "brown",
      80,
      50,
      "images/Colon_Wave.png",
      undefined,
      0.2,
      undefined,
      undefined,
      "./images/Whiteknight2.png"
    );
  }
}

class Zana extends Hero {
  constructor() {
    super(
      "./images/Zana.png",
      0.5,
      "Zana (caret)",
      "whitesmoke",
      80,
      50,
      "images/Caret.png",
      undefined,
      0.05,
      undefined,
      undefined,
      "./images/Zana2.png"
    );
  }
}

//need to make this more generic and create a laser one
class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = player.projectileLength;
    this.projectileImage = player.projectileImage;

    const projImage = new Image();

    projImage.src = this.projectileImage;

    projImage.onload = () => {
      //   const scale = 0.2;
      const scale = player.projectileScale;
      this.projImage = projImage;
      this.width = projImage.width * scale;
      this.height = projImage.height * scale;
      this.position = {
        x: player.position.x + player.projectileStartPositionX,
        y: player.position.y,
      };
    };
  }

  draw() {
    if (this.projImage) {
      c.drawImage(
        this.projImage,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// class CommaTongue extends Projectile {
class CommaTongue {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 5;
    this.height = player.projectileLength;
    this.startYPosition = -40;
  }

  draw() {
    c.fillStyle = "pink";
    c.fillRect(
      this.position.x,
      this.position.y + this.startYPosition,
      this.width,
      this.height
    );
  }

  update() {
    this.draw();
    this.height -= this.velocity.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// Maybe down the road can have the sentence move downward

let allPunctuationHit = new Set();

let player = new Hero("./images/Title_Page.png", 0.4);

let apostrophe = new Apostrophantom();
let asterisk = new MasterAsterisk();
let comma = new CommaChameleon(100);
let exclamation = new ExclaMachine();
let parenthesis = new ParentsOfTheSeas();
let period = new FullStop();
let capitalize = new FullStopGrenade();
let question = new QuestionMarkswoman();
let quotes = new QuetzalQuotel();
let colon = new SargeColon();
let semicolon = new SemiColonel();
let hyphen = new DrHyphenol();
let hashtag = new OctoThwarter(100);
let anacontraction = new AnacontractShine();
let article = new ArtTheTickler();
let ambigram = new Ambigrambador();
let foon = new Foon();
let phonia = new Phonia();
let spacel = new Spacel();
let dele = new WhiteKnight();
let zana = new Zana();
let roundabout = new Roundabout();
let betar = new Betar();

let availableHeroArray = [
  period,
  capitalize,
  colon,
  comma,
  parenthesis,
  semicolon,
  question,
  exclamation,
  apostrophe,
  quotes,
  hyphen,
  betar,
  asterisk,
  hashtag,
  anacontraction,
  ambigram,
  phonia,
  spacel,
  dele,
  zana,
  roundabout,
  article,
  foon,
];

const projectiles = [];

const PROJECTILE_HIT_MARGIN_OF_ERROR = 5;

function animate() {
  //this creates an animation loop

  //Need this or else there will be multiple Full Stops
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);

  requestAnimationFrame(animate);
  player.update();

  projectiles.forEach((projectile, index) => {
    if (nodeArr) {
      nodeArr.forEach((punctuationSymbol) => {
        //tried to do this for left and right parenthesis, might need to come back to it
        // if (punctuationSymbol.className.includes(player.symbol)) {
        if (punctuationSymbol.id === player.symbol) {
          // for Comma Chameleon. TODO refactor because only difference is projectileLength and code for when I add tongue retract
          if (
            player.symbol === comma.symbol ||
            player.symbol === hashtag.symbol
          ) {
            if (
              projectile.position.y - player.projectileLength <=
                punctuationSymbol.getBoundingClientRect().y &&
              projectile.position.x + projectile.width >=
                punctuationSymbol.getBoundingClientRect().left -
                  PROJECTILE_HIT_MARGIN_OF_ERROR &&
              projectile.position.x <=
                punctuationSymbol.getBoundingClientRect().right +
                  PROJECTILE_HIT_MARGIN_OF_ERROR
            ) {
              // console.log("hitTongue!");
              //end game logic
              allPunctuationHit.add(punctuationSymbol);
              if (
                allPunctuationHit.size === numberOfPunctuationArray.length &&
                ENDING_REACHED === false
              ) {
                // console.log("All comma Punctuation Hit!");

                changeTextToSpeechBubble(speechLineForWin, endingMessage1);

                refreshButton.classList.remove("go-away");
                root.style.setProperty(
                  "--speech-bubble-triangle",
                  projectile.position.x
                );
                root.style.setProperty("--color", player.characterColor);
                ENDING_REACHED = true;
                gameSfx.end.play();
              }

              setTimeout(() => {
                //need to change the velocity of the y to +1. this could make the tongue retract. Maybe later
                // console.log("proj", projectiles);
                player.hitProjectileSound();
                // projectiles[index].velocity.y = 1;
                projectiles.splice(index, 1);
                punctuationSymbol.classList.remove("hidden-punc");
                punctuationSymbol.style.color = `${player.characterColor}`;
                punctuationSymbol.style.textShadow =
                  "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";
              }, 0);
            } else if (projectile.position.y <= 0) {
              setTimeout(() => {
                // projectiles[index].velocity.y = 1;
                projectiles.splice(index, 1);
              }, 0);
            } else {
              if (player.secondHeroImage) {
                c.fillStyle = "white";
                c.fillRect(0, 0, canvas.width, canvas.height);
                player.update2();
              }
              projectile.update();
            }
          } else {
            if (
              //need to go through this more. Should be able to do .bottom but something up with padding
              projectile.position.y - projectile.height <=
                punctuationSymbol.getBoundingClientRect().y &&
              projectile.position.x + projectile.width >=
                punctuationSymbol.getBoundingClientRect().left -
                  PROJECTILE_HIT_MARGIN_OF_ERROR &&
              projectile.position.x <=
                punctuationSymbol.getBoundingClientRect().right +
                  PROJECTILE_HIT_MARGIN_OF_ERROR
            ) {
              // console.log("hit!");
              if (punctuationSymbol.id == capitalize.symbol) {
                setClassName("blackhole-expand", punctuationSymbol);

                setTimeout(() => {
                  punctuationSymbol.innerText =
                    punctuationSymbol.innerText.toUpperCase();
                  setClassName("blackhole-collapse", punctuationSymbol);
                }, 1800);
              } else if (
                punctuationSymbol.id === ambigram.symbol
                //&& punctuationSymbol.className === "rightside-up"
              ) {
                setClassName("upside-down", punctuationSymbol);
                setTimeout(() => {
                  punctuationSymbol.innerText = makeAmbigram(
                    punctuationSymbol.innerText
                  );
                  setClassName("rightside-up", punctuationSymbol);
                  punctuationSymbol.classList.remove("upside-down");
                }, 1800);
              } else if (punctuationSymbol.id === phonia.symbol) {
                if (punctuationSymbol.hasAttribute("data-homophones")) {
                  const span = punctuationSymbol;
                  const homophonesList = span
                    .getAttribute("data-homophones")
                    .split(",");
                  let currentIndex = parseInt(
                    span.className.replace("word-", "")
                  );

                  // Get the next index, or loop back to 0 if we're at the last word
                  let nextIndex = (currentIndex + 1) % homophonesList.length;

                  // Update the content and class
                  span.textContent = homophonesList[nextIndex];
                  span.className = `word-${nextIndex}`;
                }
              } else if (punctuationSymbol.id === betar.symbol) {
                const span = punctuationSymbol;

                // Step 1: Store original word if not already done
                if (!span.hasAttribute("data-original-word")) {
                  span.setAttribute("data-original-word", span.textContent);
                }

                const originalWord = span.getAttribute("data-original-word");
                const neighborsList = span
                  .getAttribute("data-alphabetical-neighbors")
                  .split(",");
                let currentIndex =
                  parseInt(span.className.replace("word-", "")) || 0;

                // Step 2: Wrap letters in spans if not already wrapped
                if (!span.querySelector(".letter")) {
                  const letters = span.textContent
                    .split("")
                    .map((char) => `<span class="letter">${char}</span>`);
                  span.innerHTML = letters.join("");
                }

                const letterSpans = span.querySelectorAll(".letter");

                // Step 3: Determine if we're currently showing a neighbor or original
                const currentWord = Array.from(letterSpans)
                  .map((el) => el.textContent)
                  .join("");

                if (currentWord !== originalWord) {
                  // Revert to original word
                  for (let i = 0; i < originalWord.length; i++) {
                    letterSpans[i].textContent = originalWord[i];
                  }
                  span.className = `word-${currentIndex}`;
                  return;
                }

                // Step 4: Move to next neighbor word
                const nextIndex = (currentIndex + 1) % neighborsList.length;
                const nextWord = neighborsList[nextIndex];

                // Step 5: Find the differing index
                let diffIndex = -1;
                for (let i = 0; i < originalWord.length; i++) {
                  if (originalWord[i] !== nextWord[i]) {
                    diffIndex = i;
                    break;
                  }
                }

                if (diffIndex === -1) return;

                const changingSpan = letterSpans[diffIndex];
                const fromChar = originalWord[diffIndex];
                const toChar = nextWord[diffIndex];

                spinLetter(changingSpan, fromChar, toChar, () => {
                  // After spin finishes, update full word to new neighbor
                  for (let i = 0; i < letterSpans.length; i++) {
                    letterSpans[i].textContent = nextWord[i];
                  }
                  span.className = `word-${nextIndex}`;
                });
              } else if (punctuationSymbol.id === spacel.symbol) {
                if (punctuationSymbol.hasAttribute("data-splitwords")) {
                  const [firstWord, secondWord] =
                    punctuationSymbol.dataset.splitwords.split(" ");
                  punctuationSymbol.textContent = `${firstWord} ${secondWord}`;

                  // Remove the attribute so it doesn't split again on subsequent clicks
                  punctuationSymbol.removeAttribute("data-splitwords");
                }
              } else if (punctuationSymbol.id === zana.symbol) {
                const originalText = punctuationSymbol.textContent;
                const alteredText = punctuationSymbol.dataset.caret;
                let additionalLetter = "";

                for (let i = 0; i < alteredText.length; i++) {
                  if (originalText[i] !== alteredText[i]) {
                    additionalLetter = alteredText[i];
                    break;
                  }
                }

                if (additionalLetter) {
                  const newText = alteredText.replace(
                    additionalLetter,
                    `<sup class="superscript">${additionalLetter}</sup>`
                  );
                  punctuationSymbol.innerHTML = newText;
                }
              } else if (punctuationSymbol.id === foon.symbol) {
                const animationEnd = (which, element) =>
                  new Promise((resolve) => {
                    element.addEventListener(which, function callback() {
                      element.removeEventListener(which, callback);
                      resolve();
                    });
                  });

                const swapClusters = async () => {
                  if (isAnimating) return; // If an animation is in progress, return immediately to avoid processing

                  //if (target.id !== "The Foon (Spoonerism)") return;
                  if (punctuationSymbol.id !== "The Foon (Spoonerism)") return;

                  if (previousElement) {
                    if (previousElement === punctuationSymbol) {
                      // Same element triggered in succession, so just return
                      return;
                    }
                    isAnimating = true;

                    // Determine the direction of movement
                    let targetUpwardAnimation, prevElemUpwardAnimation;
                    if (
                      punctuationSymbol.getBoundingClientRect().left <
                      previousElement.getBoundingClientRect().left
                    ) {
                      targetUpwardAnimation = "floatingUpToRight";
                      prevElemUpwardAnimation = "floatingUpToLeft";
                    } else {
                      targetUpwardAnimation = "floatingUpToLeft";
                      prevElemUpwardAnimation = "floatingUpToRight";
                    }

                    punctuationSymbol.classList.add(targetUpwardAnimation);
                    previousElement.classList.add(prevElemUpwardAnimation);

                    await Promise.all([
                      animationEnd("animationend", punctuationSymbol),
                      animationEnd("animationend", previousElement),
                    ]);

                    // Cleanup the floatingUp animations
                    punctuationSymbol.classList.remove(targetUpwardAnimation);
                    previousElement.classList.remove(prevElemUpwardAnimation);

                    // Swap the actual clusters
                    const tempClass = punctuationSymbol.className;
                    punctuationSymbol.className = previousElement.className;
                    previousElement.className = tempClass;

                    const tempText = punctuationSymbol.textContent;
                    punctuationSymbol.textContent = previousElement.textContent;
                    previousElement.textContent = tempText;

                    // Apply the "float down" animation based on direction
                    let targetDownwardAnimation, prevElemDownwardAnimation;
                    if (targetUpwardAnimation === "floatingUpToLeft") {
                      targetDownwardAnimation = "floatingDownFromLeft";
                      prevElemDownwardAnimation = "floatingDownFromRight";
                    } else {
                      targetDownwardAnimation = "floatingDownFromRight";
                      prevElemDownwardAnimation = "floatingDownFromLeft";
                    }

                    punctuationSymbol.classList.add(targetDownwardAnimation);
                    previousElement.classList.add(prevElemDownwardAnimation);

                    await Promise.all([
                      animationEnd("animationend", punctuationSymbol),
                      animationEnd("animationend", previousElement),
                    ]);

                    // Clean up post-animation
                    punctuationSymbol.classList.remove(targetDownwardAnimation);
                    previousElement.classList.remove(prevElemDownwardAnimation);
                    previousElement = null;
                    isAnimating = false;
                    previousElement.style.textDecoration = "none";
                    // Reset for the next interaction
                  } else {
                    punctuationSymbol.style.textDecoration = "underline";
                    previousElement = punctuationSymbol;
                  }
                };

                swapClusters();
              } else if (punctuationSymbol.id === dele.symbol) {
                if (punctuationSymbol.getAttribute("data-handled") === "true")
                  return;
                punctuationSymbol.setAttribute("data-handled", "true");

                // Get the word to change into from the data-wited-word attribute
                const witedWord =
                  punctuationSymbol.getAttribute("data-wited-word");
                const originalWord = punctuationSymbol.textContent;
                let indexToFadeOut = -1;

                // Find the index of the letter that is different between the original word and the wited word
                for (let i = 0; i < originalWord.length; i++) {
                  if (witedWord.indexOf(originalWord[i]) === -1) {
                    indexToFadeOut = i;
                    break;
                  }
                }

                // Split the word into parts: before, the letter to fade out, and after
                const partBefore = originalWord.slice(0, indexToFadeOut);
                const partAfter = originalWord.slice(indexToFadeOut + 1);
                const letterToFadeOut = originalWord[indexToFadeOut];

                // Wrap the letter to fade out in a span with the fade-out class
                punctuationSymbol.innerHTML =
                  partBefore +
                  `<span class="fade-out">${letterToFadeOut}</span>` +
                  partAfter;

                // Wait for the next frame so the browser acknowledges the new span and then start the fade out
                requestAnimationFrame(() => {
                  const fadeOutSpan =
                    punctuationSymbol.querySelector(".fade-out");
                  fadeOutSpan.style.transition = "opacity 0.5s";
                  fadeOutSpan.style.opacity = "0";

                  // After the fade out transition, set the text to the wited word
                  setTimeout(() => {
                    punctuationSymbol.textContent = witedWord;
                  }, 500); // This duration should match the CSS transition
                });
              } else if (punctuationSymbol.id === roundabout.symbol) {
                if (punctuationSymbol.getAttribute("data-handled") === "true")
                  return;
                punctuationSymbol.setAttribute("data-handled", "true");

                const roundedWord = punctuationSymbol.dataset.roundedWord;
                const currentWord = punctuationSymbol.textContent.trim();
                const flashDuration = 500; //  ❰❰  milliseconds to keep the CAPS word visible ❱❱

                /* STEP 1 – show original word in CAPS */
                punctuationSymbol.textContent = currentWord.toUpperCase();

                /* STEP 2 – after flashDuration ms, swap to rounded word & style */
                setTimeout(() => {
                  punctuationSymbol.textContent = roundedWord.toUpperCase();
                  punctuationSymbol.classList.add("rounded-word");
                }, flashDuration);
              } else {
                punctuationSymbol.style.color = `${player.characterColor}`;
                punctuationSymbol.style.textShadow =
                  "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";
              }

              allPunctuationHit.add(punctuationSymbol);
              if (
                allPunctuationHit.size === numberOfPunctuationArray.length &&
                ENDING_REACHED === false
              ) {
                // console.log("All Punctuation Hit!");
                changeTextToSpeechBubble(speechLineForWin, endingMessage1);
                refreshButton.classList.remove("go-away");
                root.style.setProperty(
                  "--speech-bubble-triangle",
                  projectile.position.x
                );
                root.style.setProperty("--color", player.characterColor);
                ENDING_REACHED = true;
                gameSfx.end.play();
              }
              setTimeout(() => {
                projectiles.splice(index, 1);
                player.hitProjectileSound();

                if (player.symbol === asterisk.symbol) {
                  if (punctuationSymbol.previousSibling === null) return;
                  let words = punctuationSymbol.previousSibling.data.split(" ");
                  let capital =
                    punctuationSymbol.previousSibling.previousSibling;
                  if (capital?.id === capitalize.symbol) {
                    let lastWord = `${capital["innerText"]}${
                      words[words.length - 1]
                    }`;
                    freeDictionaryFetchDefinition(lastWord);
                    footNote.classList.remove("go-away");
                  } else {
                    let lastWord = words[words.length - 1];
                    freeDictionaryFetchDefinition(lastWord);
                    footNote.classList.remove("go-away");
                  }
                }
                punctuationSymbol.classList.remove("hidden-punc");
              }, 0);

              if (player.symbol === anacontraction.symbol) {
                shortenContraction(punctuationSymbol);
              }
              if (player.symbol === article.symbol) {
                const currentText = punctuationSymbol.textContent;
                const alternateText =
                  punctuationSymbol.getAttribute("data-alternate");

                punctuationSymbol.textContent = alternateText;
                punctuationSymbol.setAttribute("data-alternate", currentText);

                punctuationSymbol.classList.add("giggling-text");
                setTimeout(function () {
                  punctuationSymbol.classList.remove("giggling-text");
                }, 900); // Remove the giggling effect after 0.3s * 3 iterations
              }
              //Garbage collection for when the projectile goes off the screen. Settimeout prevents flashing of projectile
            } else if (projectile.position.y + projectile.height <= 0) {
              setTimeout(() => {
                projectiles.splice(index, 1);
              }, 0);
            } else {
              //hero disappears otherwise.
              if (player.secondHeroImage) {
                c.fillStyle = "white";
                c.fillRect(0, 0, canvas.width, canvas.height);
                player.update2();
              }
              projectile.update();
            }
          }
        }
      });
    }
  });
}

//mySong.play();
animate();

//https://stackoverflow.com/questions/69491293/how-to-do-a-work-when-mousedown-until-mouseup

//Do not want the user to be able to move the title team page
function doActionOnce() {
  if (bRightAfterSentenceIsLoaded) {
    bRightAfterSentenceIsLoaded = false;
    //console.log("Action triggered!");

    player = chosenHeroArray[0];
    // Clean up event listeners
    document.removeEventListener("keydown", handleFirstClickOrKeyPress);
    document.removeEventListener("click", handleFirstClickOrKeyPress);

    hintButton.setAttribute("class", "");
  }
}

function handleFirstClickOrKeyPress() {
  doActionOnce();
}

// Attach listeners
document.addEventListener("keydown", handleFirstClickOrKeyPress);
document.addEventListener("click", handleFirstClickOrKeyPress);

leftButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  let interval = setInterval(() => {
    //want them to be able to move off the screen a little hence the subtraction
    if (player.position.x >= 0 - player.width / 2) {
      // player.velocity.x = -5;
      player.position.x -= 10;
    }
  }, 50);
  leftButton.addEventListener("pointerup", () => {
    clearInterval(interval);
  });
});

rightButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  let interval = setInterval(() => {
    if (player.position.x <= canvas.width - player.width / 2) {
      player.position.x += 10;
    }
  }, 50);
  rightButton.addEventListener("pointerup", () => {
    clearInterval(interval);
  });
});

shootButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  player.shootProjectileSound();
  if (player === comma || player === hashtag) {
    projectiles.push(
      new CommaTongue({
        position: {
          x: player.position.x + player.width - player.projectileStartPositionX,
          y: player.position.y,
        },
        velocity: {
          x: 0,
          y: -10,
        },
      })
    );
  } else if (player.characterColor !== undefined) {
    projectiles.push(
      new Projectile({
        position: {
          x: player.position.x + player.width - player.projectileStartPositionX,
          y: player.position.y,
        },
        velocity: {
          x: 0,
          y: -10,
        },
      })
    );
    // player.draw2();
    // player.update2();
  }
});
console.log("node2", nodeArr);

switchButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();

  //This initially makes the hint button appear, should make it more specific down the road so can add more classes if needed

  //This code will make it so the tongue doesn't stay on the screen if comma chameleon is switched out. All other projectiles will stay though
  if (
    projectiles.length &&
    projectiles[0]?.constructor?.name === "CommaTongue"
  ) {
    projectiles.length = 0;
  }

  if (player === chosenHeroArray[chosenHeroArray.length - 1]) {
    player = chosenHeroArray[0];
  } else {
    player = chosenHeroArray[chosenHeroArray.indexOf(player) + 1];
  }
  nameTag.innerText = player.symbol;
  root.style.setProperty("--color", player.characterColor);
});

hintButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();

  numberOfPunctuationArray.forEach((punctuationSymbol) => {
    if (punctuationSymbol.className === "hidden-punc") {
      punctuationSymbol.className += " highlighted-punc";

      setTimeout(() => {
        punctuationSymbol.classList.remove("highlighted-punc");
      }, 1000);
    } else if (punctuationSymbol.classList.contains("capital-black-hole")) {
      punctuationSymbol.className += " hint-capital-underline";

      setTimeout(() => {
        punctuationSymbol.classList.remove("hint-capital-underline");
      }, 1000);
    } else if (secondContractionWordSet.has(punctuationSymbol.className)) {
      punctuationSymbol.className += " hint-contraction-underline";

      setTimeout(() => {
        punctuationSymbol.classList.remove("hint-contraction-underline");
      }, 1000);
    } else if (
      punctuationSymbol.classList.contains("a") ||
      punctuationSymbol.classList.contains("the") ||
      punctuationSymbol.classList.contains("an")
    ) {
      punctuationSymbol.className += " hint-article-underline";

      setTimeout(() => {
        punctuationSymbol.classList.remove("hint-article-underline");
      }, 1000);
    }
  });

  if (nodeArr && numberOfPunctuationArray.length === 0) {
    nodeArr.forEach((punctuationSymbol) => {
      //if (punctuationSymbol.hasAttribute("id")) {
      if (punctuationSymbol.id) {
        //This is just generic for any of the wordplay ones
        // or .hasAttribute("id")
        console.log("hitn");
        punctuationSymbol.setAttribute("data-hint", "1"); // value can be whatever

        setTimeout(() => {
          punctuationSymbol.removeAttribute("data-hint");
        }, 1000);
      }
    });
  }
});

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
    case "ArrowLeft":
      if (chosenHeroArray.length === 0) return;
      if (player.position.x >= 0 - player.width / 2) {
        player.position.x -= 10;
      }
      break;

    case "d":
    case "ArrowRight":
      if (chosenHeroArray.length === 0) return;
      if (player.position.x <= canvas.width - player.width / 2) {
        player.position.x += 10;
      }
      break;

    case "ArrowDown":
      if (
        projectiles.length &&
        projectiles[0]?.constructor?.name === "CommaTongue"
      ) {
        projectiles.length = 0;
      }

      if (player === chosenHeroArray[chosenHeroArray.length - 1]) {
        player = chosenHeroArray[0];
      } else {
        player = chosenHeroArray[chosenHeroArray.indexOf(player) + 1];
      }
      nameTag.innerText = player.symbol;
      root.style.setProperty("--color", player.characterColor);
      break;

    //case "w":  This causes second animation to show if a w is typed in initial sentence
    case "ArrowUp":
      player.shootProjectileSound();
      if (player === comma || player === hashtag) {
        projectiles.push(
          new CommaTongue({
            position: {
              x:
                player.position.x +
                player.width -
                player.projectileStartPositionX,
              y: player.position.y,
            },
            velocity: {
              x: 0,
              y: -10,
            },
          })
        );
      } else if (player.characterColor !== undefined) {
        projectiles.push(
          new Projectile({
            position: {
              x:
                player.position.x +
                player.width -
                player.projectileStartPositionX,
              y: player.position.y,
            },
            velocity: {
              x: 0,
              y: -10,
            },
          })
        );
      }
  }
});

let elm = await waitForElement("span");
let chosenHeroArray = heroToTheRescue(nodeArr, availableHeroArray);

let freeDictionaryFetchDefinition = async (word) => {
  let res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
  );
  let data = await res.json();
  console.log({ data });

  let definition;
  if (!data[0]) {
    definition = data.title;
  } else {
    definition = data[0].meanings[0].definitions[0].definition;
  }

  const footnoteTitle = document.getElementById("footnote_title");
  const footnoteBody = document.getElementById("footnote--body");

  footnoteBody.innerText = `*${definition}`;
  footnoteTitle.innerText = `*${word}`;
  footNote.innerText = `*${word}`;
};
