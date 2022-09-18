const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor() {
    console.log("this", this.height);
    console.log("height", canvas.height - this.height);
    this.position = {
      //   x: 200,
      x: canvas.width / 2,
      //   y: canvas.height - this.height - 10,
      y: canvas.height,
    };

    this.velocity = {
      x: 0,
      y: 0,
    };

    // this.image =
    this.width = 50;
    this.height = 50;
  }

  draw() {
    c.fillStyle = "red";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

const player = new Player();
player.draw();

function animate() {
  //this creates an animation loop
  requestAnimationFrame(animate);
  player.draw();
}

animate();
