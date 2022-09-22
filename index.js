const canvas = document.getElementById("background");
const c = canvas.getContext("2d");
// const period = document.getElementById("first");

const sentence = document.getElementById("input-sentence");
const button = document.getElementById("punc-button");
const out1 = document.getElementById("output");

console.log("button", button);

//Might be able to use Intersection Observer to make this more efficient
// console.log("per", period.getBoundingClientRect());

canvas.width = innerWidth;
canvas.height = innerHeight;

let punc = "!?;:'.,";

const punctuationHashMap = new Map();

//this is called chaining
punctuationHashMap
  .set("!", "e")
  .set("?", "q")
  .set(";", "sc")
  .set(":", "c")
  .set("'", "ap")
  .set("*", "as")
  .set(",", "co")
  .set(".", "p");

const addSpansAndIds = (string) => {
  let newString = string.split("");

  console.log("newstr1", newString);

  newString.map((char, i) => {
    if (punctuationHashMap.has(char)) {
      newString[i] = `<span id="hidden-punc" class=\"${punctuationHashMap.get(
        char
      )}\">${char}</span>`;
    }
  });

  console.log("newstr2", newString);
  out1.innerHTML = newString.join("");
  console.log("out", out1);
  button.setAttribute("class", "go-away");
  sentence.setAttribute("class", "go-away");

  //This is an HTMLCollection //Need to wait for the spans to appear so this doesn't work
  //   const periods = document.querySelectorAll(".p");
  //   console.log({ periods });

  //   let periodsArray = [];
  //   Array.from(periods).forEach((el) => {
  //     console.log(el.getBoundingClientRect());
  //     periodsArray.push(el);
  //   });
  //   console.log("arr", periodsArray);

  //   return newString.join("");
};

button.addEventListener("click", () => addSpansAndIds(sentence.value));
let nodeObj = {};
let nodeArr = [];
// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      console.log("in");
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      console.log("mut", mutations[0].addedNodes);
      let mutArr = mutations[0].addedNodes;
      mutArr.forEach((el) => {
        // console.log("class", el.className);

        if (el.className) {
          //this does not work because the el loses it's position when changed into object
          //   nodeObj[el.className] = el;
          //   nodeArr.push(nodeObj);
          nodeArr.push(el);
        }

        //this can be replaced with if (el.className)
        // if (
        //   el.className === "p" ||
        //   el.className === "ap" ||
        //   el.className === "e" ||
        //   el.className === "q" ||
        //   el.className === "sc" ||
        //   el.className === "c" ||
        //   el.className === "as" ||
        //   el.className === "co"
        // ) {
        //   nodeArr.push(el);
        // }
      });

      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

class Hero {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();

    image.src = "./images/fs.png";
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

//this is what he uses in the video but so far seems unnecessary
// const keys = {
//   a: {
//     pressed: false,
//   },
//   d: {
//     pressed: false,
//   },
// };

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = 50;
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

const player = new Hero();

const projectiles = [];

function animate() {
  //this creates an animation loop
  requestAnimationFrame(animate);
  //Need this or else there will be multiple Full Stops
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();

  projectiles.forEach((projectile, index) => {
    // console.log("test", projectile.position.x);
    // console.log("in per", period.getBoundingClientRect().x);
    if (nodeArr) {
      nodeArr.forEach((period) => {
        if (period.className === "p") {
          if (
            projectile.position.y - projectile.height / 2 <=
              period.getBoundingClientRect().y &&
            projectile.position.x >= period.getBoundingClientRect().x &&
            projectile.position.x <=
              period.getBoundingClientRect().x +
                period.getBoundingClientRect().width
          ) {
            console.log("hit!");
            setTimeout(() => {
              projectiles.splice(index, 1);
              period.removeAttribute("id");
            }, 0);
            //   console.log("per2", period.p);
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
    case " ":
      //   console.log("up");
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width - 30,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10,
          },
        })
      );
      break;
  }
});

//can probably get rid of this sometime
const elm = await waitForElm(".p");
// console.log({ elm });
console.log({ nodeArr });
