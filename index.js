import { addSpansAndIds } from "./utils/utils.js";
import { waitForElement } from "./utils/utils.js";
import { nodeArr } from "./utils/utils.js";
import { heroToTheRescue } from "./utils/utils.js";

const canvas = document.getElementById("background");
const c = canvas.getContext("2d");
// const period = document.getElementById("first");

const sentence = document.getElementById("input-sentence");
const button = document.getElementById("punc-button");
const out1 = document.getElementById("output");
const footer = document.getElementById("footer");
const start = document.getElementById("start");
const banner = document.getElementById("banner");
const endingMessage =
  "You found all the punctuation! Refresh the page to play again!";

//Might be able to use Intersection Observer to make this more efficient
// console.log("per", period.getBoundingClientRect());

//number accounts for the padding and height of the inputs. Need to fix for when that goes away
canvas.width = innerWidth - 4;
canvas.height = innerHeight - 50;

button.addEventListener("click", () =>
  addSpansAndIds(sentence.value, sentence, button, out1, footer, banner, start)
);

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
    projectileStartPositionX,
    projectileLength,
    projectileImage,
    projectileShootSound,
    projectileScale,
    projectileSoundRate,
    projectileSoundVolume,
    secondHeroImage
  ) {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.heroImage = heroImage;
    this.heroScale = heroScale;
    this.symbol = symbol;
    this.projectileStartPositionX = projectileStartPositionX;
    this.projectileLength = projectileLength;
    this.projectileImage = projectileImage;
    this.projectileShootSound = projectileShootSound;
    this.projectileScale = projectileScale;
    this.projectileSoundRate = projectileSoundRate;
    this.projectileSoundVolume = projectileSoundVolume;
    this.secondHeroImage = secondHeroImage;

    this.sfx = {
      shoot: new Howl({
        src: [this.projectileShootSound],
        rate: this.projectileSoundRate,
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

    //this needs refactored

    // this.imageArray = [image, image2];

    // this.millSecondsPerImage = 100;
    // this.currentTime = new Date().valueOf();

    // this.imageToDraw =
    //   this.imageArray[
    //     Math.floor(this.currentTime / this.millSecondsPerImage) %
    //       this.imageArray.length
    //   ];
  }

  shootProjectileSound() {
    this.sfx.shoot.play();
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
    console.log("hmm", this.image2);
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
projectileStartPositionX,
projectileLength,
projectileImage,
projectileShootSound,
projectileScale,
projectileSoundRate
projectileSoundVolume
*/
//create a function that makes him disappear when projectile shoots
class Apostrophantom extends Hero {
  constructor() {
    super(
      "./images/Apostrophantom.png",
      0.8,
      "apostrophe",
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
      "./images/cc.png",
      0.5,
      "comma",
      70,
      projectileLength,
      undefined,
      "./sounds/lick.mp3",
      0.2
    );
  }
}

class DrHyphenol extends Hero {
  constructor() {
    super(
      "./images/Hyphenol_1.png",
      0.6,
      "hyphen",
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
      "exclamation",
      118,
      50,
      "./images/EM_Belt.png",
      "./sounds/whoosh.mp3",
      0.5
    );
  }
}

class FullStop extends Hero {
  constructor() {
    super(
      "./images/fs.png",
      0.5,
      "period",
      110,
      50,
      "./images/Laser.png",
      "./sounds/laser-bolt.mp3",
      0.2
    );
  }
}

class ParentsOfTheSeas extends Hero {
  constructor() {
    super(
      "./images/Parents.png",
      0.35,
      "parenthesis",
      50,
      50,
      "./images/Bubble.png",
      undefined,
      0.1
    );
  }
}

class QuestionMarkswoman extends Hero {
  constructor() {
    super(
      "./images/qm.png",
      0.7,
      "question",
      126,
      50,
      "./images/Arrow.png",
      "./sounds/arrow-shot.mp3",
      0.2
    );
  }
}

//need to fix with code or choose different font so we get smart quotes instead of dumb quotes https://www.fontshop.com/content/curly-quotes
class QuetzalQuotel extends Hero {
  constructor() {
    super(
      "./images/Qq.png",
      0.7,
      "quotes",
      126,
      50,
      "./images/Feather.png",
      undefined,
      0.1
    );
  }
}

class SargeColon extends Hero {
  constructor() {
    super(
      "./images/Colon1.png",
      0.9,
      "colon",
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
      "semicolon",
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

//this is what he uses in the video for velocity but so far seems unnecessary
// const keys = {
//   a: {
//     pressed: false,
//   },
//   d: {
//     pressed: false,
//   },
// };

//need to make this more generic and create a laser one
class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = player.projectileLength;
    this.projectileImage = player.projectileImage;
    // console.log("is it here", this.projectileImage);

    const projImage = new Image();

    projImage.src = this.projectileImage;
    // console.log("projI", projImage);

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
    // else {
    //   c.fillStyle = "red";
    //   c.fillRect(this.position.x, this.position.y, this.width, this.height);
    // }
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
  }

  //if I add color param can cut this out
  draw() {
    c.fillStyle = "pink";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.height -= this.velocity.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// Maybe down the road can have the sentence move downward
// class MovingSentence {
//   constructor({ position, velocity }) {
//     this.position = position;
//     this.velocity = velocity;
//   }

//   update() {
//     this.draw();
//     this.position.y += this.velocity.y;
//   }
// }

let allPunctuationHit = new Set();

// let player = new Hero("./images/fs.png", "period", 0);
let player = new Hero("./images/Generic.png", 0.7);

let apostrophe = new Apostrophantom();
let comma = new CommaChameleon(100);
let exclamation = new ExclaMachine();
let parenthesis = new ParentsOfTheSeas();
let period = new FullStop();
let question = new QuestionMarkswoman();
let quotes = new QuetzalQuotel();
let colon = new SargeColon();
let semicolon = new SemiColonel();
let hyphen = new DrHyphenol();

let availableHeroArray = [
  period,
  colon,
  comma,
  parenthesis,
  semicolon,
  question,
  exclamation,
  apostrophe,
  quotes,
  hyphen,
];

const projectiles = [];

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
        if (punctuationSymbol.className === player.symbol) {
          //Comma Chameleon
          if (player.symbol === "comma") {
            if (
              projectile.position.y - player.projectileLength <=
                punctuationSymbol.getBoundingClientRect().y &&
              projectile.position.x >=
                punctuationSymbol.getBoundingClientRect().x &&
              projectile.position.x <=
                punctuationSymbol.getBoundingClientRect().x +
                  punctuationSymbol.getBoundingClientRect().width
            ) {
              // console.log("hitTongue!");
              //end game logic
              allPunctuationHit.add(punctuationSymbol);
              if (allPunctuationHit.size === nodeArr.length) {
                // console.log("All Punctuation Hit!");
                start.setHTML(endingMessage);
                gameSfx.end.play();
              }

              setTimeout(() => {
                //need to change the velocity of the y to +1. this could make the tongue retract. Maybe later
                console.log("proj", projectiles);

                // projectiles[index].velocity.y = 1;
                projectiles.splice(index, 1);
                punctuationSymbol.removeAttribute("id");
              }, 0);
            } else if (projectile.position.y <= 0) {
              setTimeout(() => {
                // projectiles[index].velocity.y = 1;
                projectiles.splice(index, 1);
              }, 0);
            } else {
              projectile.update();
            }
          } else {
            if (
              projectile.position.y - projectile.height <=
                punctuationSymbol.getBoundingClientRect().y &&
              projectile.position.x >=
                punctuationSymbol.getBoundingClientRect().x &&
              projectile.position.x <=
                punctuationSymbol.getBoundingClientRect().x +
                  punctuationSymbol.getBoundingClientRect().width
            ) {
              // console.log("hit!");
              allPunctuationHit.add(punctuationSymbol);
              if (allPunctuationHit.size === nodeArr.length) {
                // console.log("All Punctuation Hit!");
                start.setHTML(endingMessage);
                gameSfx.end.play();
              }
              setTimeout(() => {
                projectiles.splice(index, 1);
                punctuationSymbol.removeAttribute("id");
              }, 0);

              //Garbage collection for when the projectile goes off the screen. Settimeout prevents flashing of projectile
            } else if (projectile.position.y + projectile.height <= 0) {
              setTimeout(() => {
                projectiles.splice(index, 1);
              }, 0);
            } else {
              //hero disappears otherwise. Can use this for apostrophantom though
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
  //   console.log("proj", projectiles[0]?.position.y);
}

animate();

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "ArrowLeft":
      if (player.position.x >= 0) {
        // player.velocity.x = -5;
        player.position.x -= 10;
      }
      break;
    case "ArrowRight":
      if (player.position.x <= canvas.width - player.width) {
        player.position.x += 10;
      }
      break;
    case "ArrowUp":
      //Comma Chameleon

      player.shootProjectileSound();
      if (player === comma) {
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
        break;
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
        // player.draw2();
        // player.update2();
        console.log("pro Image", player.projectileImage);
        break;
      }
    case "ArrowDown":
      start.setHTML("");
      // This is how you switch characters

      if (player === chosenHeroArray[chosenHeroArray.length - 1]) {
        player = chosenHeroArray[0];
      } else {
        player = chosenHeroArray[chosenHeroArray.indexOf(player) + 1];
      }
  }
});

const elm = await waitForElement("span");
const chosenHeroArray = heroToTheRescue(nodeArr, availableHeroArray);
