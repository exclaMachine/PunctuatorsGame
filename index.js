import { addSpansAndIds } from "./utils/utils.js";
import { waitForElement } from "./utils/utils.js";
import { nodeArr } from "./utils/utils.js";

const canvas = document.getElementById("background");
const c = canvas.getContext("2d");
// const period = document.getElementById("first");

const sentence = document.getElementById("input-sentence");
const button = document.getElementById("punc-button");
const out1 = document.getElementById("output");

//Might be able to use Intersection Observer to make this more efficient
// console.log("per", period.getBoundingClientRect());

canvas.width = innerWidth;
canvas.height = innerHeight;

button.addEventListener("click", () =>
  addSpansAndIds(sentence.value, sentence, button, out1)
);

class Hero {
  constructor(
    heroImage,
    symbol,
    playerNumber,
    projectileStartPositionX,
    projectileLength
  ) {
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.heroImage = heroImage;
    this.symbol = symbol;
    this.playerNumber = playerNumber;
    this.projectileStartPositionX = projectileStartPositionX;
    this.projectileLength = projectileLength;

    const image = new Image();

    image.src = this.heroImage;
    image.onload = () => {
      const scale = 0.5;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height,
      };
    };
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

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }
}

class FullStop extends Hero {
  constructor() {
    super("./images/fs.png", "period", 0, 30, 50);
  }
}

class CommaChameleon extends Hero {
  constructor(projectileLength) {
    super("./images/cc.png", "comma", 1, 70, projectileLength);
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
  }

  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
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

// const player = new Hero("./images/fs.png", "period", 0);

let player = new FullStop();
let player2 = new CommaChameleon(100);

const heroArray = [player, player2];

const projectiles = [];

// class Arrow extends Projectile {
//   constructor({ position, velocity }) {
//     super(position, velocity, "q");
//   }
// }

// const arrow = new Arrow();

function animate() {
  //this creates an animation loop
  requestAnimationFrame(animate);
  //Need this or else there will be multiple Full Stops
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();

  projectiles.forEach((projectile, index) => {
    if (nodeArr) {
      nodeArr.forEach((punctuationSymbol) => {
        // if (period.className === "p") {
        if (punctuationSymbol.className === player.symbol) {
          if (
            projectile.position.y - projectile.height / 2 <=
              punctuationSymbol.getBoundingClientRect().y &&
            projectile.position.x >=
              punctuationSymbol.getBoundingClientRect().x &&
            projectile.position.x <=
              punctuationSymbol.getBoundingClientRect().x +
                punctuationSymbol.getBoundingClientRect().width
          ) {
            console.log("hit!");
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
            projectile.update();
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
      break;
    case "ArrowDown":
      // This is how you switch characters
      if (player.playerNumber === heroArray.length - 1) {
        player = heroArray[0];
      } else {
        player = heroArray[player.playerNumber + 1];
      }
  }
});

const elm = await waitForElement("span");
// console.log({ elm });
console.log({ nodeArr });
