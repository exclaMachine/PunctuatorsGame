const canvas = document.getElementById("background");
const c = canvas.getContext("2d");
// const period = document.getElementById("first");

//This is an HTMLCollection
const periods = document.getElementsByClassName("fs");

let periodsArray = [];
Array.from(periods).forEach((el) => {
  console.log(el.getBoundingClientRect());
  periodsArray.push(el);
});
console.log("arr", periodsArray);
//Might be able to use Intersection Observer to make this more efficient
// console.log("per", period.getBoundingClientRect());

canvas.width = innerWidth;
canvas.height = innerHeight;

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

class MovingSentence {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
  }
}

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
    periodsArray.forEach((period) => {
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
        console.log("per2", period);
        //Garbage collection for when the projectile goes off the screen. Settimeout prevents flashing of projectile
      } else if (projectile.position.y + projectile.height <= 0) {
        setTimeout(() => {
          projectiles.splice(index, 1);
        }, 0);
      } else {
        projectile.update();
      }
    });
  });
  //   console.log("proj", projectiles[0]?.position.y);
}

animate();

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "a":
      if (player.position.x >= 0) {
        // player.velocity.x = -5;
        player.position.x -= 10;
      }
      break;
    case "d":
      if (player.position.x <= canvas.width - player.width) {
        player.position.x += 10;
      }
      break;
    case " ":
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
