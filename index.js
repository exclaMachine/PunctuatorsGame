import { addSpansAndIds } from "./utils/utils.js";
import { waitForElement } from "./utils/utils.js";
import { nodeArr, numberOfPunctuationArray } from "./utils/utils.js";
import { heroToTheRescue } from "./utils/utils.js";
import { setClassName } from "./utils/utils.js";
import { createRandomMadLibSentence } from "./SentenceFunc.js";
import { surroundContractionWordsWithSpans } from "./utils/contractionFunc.js";

const canvas = document.getElementById("background");
const c = canvas.getContext("2d");
// const period = document.getElementById("first");

let root = document.documentElement;

let CREATE_SENTENCE_COUNT = 1;
let SWITCH_CASE_NUMBER = 2;

const ENDING_MESSAGE1 = "You found all the punctuation and capital letters!";
const ENDING_MESSAGE2 = "Refresh the page to play again!";
const PUNC_REGEX = /[\'\".,\/#!$%\^&\*;:{}=\-_`~()\‘\’\“\”]/g;

const errorMessage = document.getElementById("error-message");
const characterCount = document.getElementById("character-count");
const initialTypedSentence = document.getElementById("input-sentence");
const removePuncButton = document.getElementById("punc-button");
const createSentenceButton = document.getElementById("create-sentence-button");
const out1 = document.getElementById("output");
const footer = document.getElementById("footer");
const start = document.getElementById("start");
const startBanner = document.getElementById("banner");

const endingMessage1 = document.getElementById("ending_message_1");
const endingMessage2 = document.getElementById("ending_message_2");

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

console.log({ nodeArr });

const buttonSounds = {
  clicky: new Howl({
    src: ["./sounds/click.mp3"],
  }),
};

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    buttonSounds.clicky.play();
    const modal = document.querySelector(button.dataset.modalTarget);
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
//Might be able to use Intersection Observer to make this more efficient
// console.log("per", period.getBoundingClientRect());

//number accounts for the padding and height of the inputs. Need to fix for when that goes away
canvas.width = innerWidth - 4;
canvas.height = innerHeight - 50;

removePuncButton.addEventListener("click", () => {
  buttonSounds.clicky.play();
  if (!initialTypedSentence.value) {
    return (errorMessage.innerText = "Field cannot be blank");
  }

  if (!PUNC_REGEX.test(initialTypedSentence.value)) {
    return (errorMessage.innerText = "Sentence must have punctuation!");
  }

  let punctuated = addSpansAndIds(initialTypedSentence.value, out1);
  surroundContractionWordsWithSpans(punctuated, out1);

  setClassName("go-away", initialTypedSentence, removePuncButton, startBanner);
  setClassName("grid-container", characterControls);

  errorMessage.innerText = "";
});

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

class Hero {
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

/*heroImage,
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
secondHeroImage
*/
//create a function that makes him disappear when projectile shoots
class Anacontraction extends Hero {
  constructor() {
    super(
      "./images/Ana.png",
      0.8,
      "Anacontraction",
      "gold",
      118,
      50,
      "./images/Ectoplasm.png",
      undefined,
      0.2,
      5.0,
      undefined,
      "white"
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
      "Octo-Thwarter #",
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
      "Dr. Hyphenol -",
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

let player = new Hero("./images/Generic.png", 0.7);

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
  asterisk,
  hashtag,
];

// characterCount.setHTML(`${availableHeroArray.length}`);

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
              if (allPunctuationHit.size === numberOfPunctuationArray.length) {
                // console.log("All Punctuation Hit!");
                endingMessage1.innerText = ENDING_MESSAGE1;
                endingMessage2.innerText = ENDING_MESSAGE2;
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
              } else {
                punctuationSymbol.style.color = `${player.characterColor}`;
                punctuationSymbol.style.textShadow =
                  "1px 0 0 #000, 0 -1px 0 #000, 0 1px 0 #000, -1px 0 0 #000";
              }

              allPunctuationHit.add(punctuationSymbol);
              if (allPunctuationHit.size === numberOfPunctuationArray.length) {
                // console.log("All Punctuation Hit!");
                endingMessage1.innerText = ENDING_MESSAGE1;
                endingMessage2.innerText = ENDING_MESSAGE2;
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

animate();

//https://stackoverflow.com/questions/69491293/how-to-do-a-work-when-mousedown-until-mouseup

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
  } else {
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

switchButton.addEventListener("pointerdown", (e) => {
  e.preventDefault();

  //This initially makes the hint button appear, should make it more specific down the road so can add more classes if needed
  hintButton.setAttribute("class", "");

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
    if (punctuationSymbol.className) {
      punctuationSymbol.className += " highlighted-punc";

      setTimeout(() => {
        punctuationSymbol.classList.remove("highlighted-punc");
      }, 1000);
    }
  });
});

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
    case "ArrowLeft":
      if (player.position.x >= 0 - player.width / 2) {
        player.position.x -= 10;
      }
      break;

    case "d":
    case "ArrowRight":
      if (player.position.x <= canvas.width - player.width / 2) {
        player.position.x += 10;
      }
      break;

    case "ArrowDown":
      hintButton.setAttribute("class", "");

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
      } else {
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

const elm = await waitForElement("span");
const chosenHeroArray = heroToTheRescue(nodeArr, availableHeroArray);

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
