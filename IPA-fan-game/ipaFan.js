const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Boundary {
  constructor({ position, image }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image;
  }
  static width = 40;
  static height = 40;

  draw() {
    //ctx.fillStyle = "blue";
    //ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }
}

class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 16;
  }

  //TODO make this excla machine instead of a circle
  draw() {
    ctx.beginPath();

    // Center coordinates for the octagon
    const centerX = this.position.x;
    const centerY = this.position.y;

    // Calculate the angle between vertices
    const angle = (Math.PI * 2) / 8; // 360 degrees divided by 8

    // Rotate the octagon to make the bottom flat side
    const rotationOffset = angle / 2;

    // Move to the first vertex
    ctx.moveTo(
      centerX + this.radius * Math.cos(rotationOffset),
      centerY + this.radius * Math.sin(rotationOffset)
    );

    // Loop to create the other 7 vertices
    for (let i = 1; i <= 8; i++) {
      const x = centerX + this.radius * Math.cos(i * angle + rotationOffset);
      const y = centerY + this.radius * Math.sin(i * angle + rotationOffset);
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillStyle = "yellow";
    ctx.fill();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const boundaries = [];
const player = new Player({
  position: {
    x: Boundary.width * 1.5,
    y: Boundary.height * 1.5,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastKey = "";

const map = [
  ["-", "-", "-", "-", "-", "-", "-"],
  ["|", " ", " ", " ", " ", " ", "|"],
  ["|", " ", "-", " ", "-", " ", "|"],
  ["|", " ", " ", " ", " ", " ", "|"],
  ["|", " ", "-", " ", "-", " ", "|"],
  ["|", " ", " ", " ", " ", " ", "|"],
  ["-", "-", "-", "-", "-", "-", "-"],
];

function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeHorizontal.png"),
          })
        );
        break;
      case "|":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeVertical.png"),
          })
        );
        break;
    }
  });
});

function circleCollidesWithRectangle({ octagon, rectangle }) {
  return (
    octagon.position.y - octagon.radius + octagon.velocity.y <=
      rectangle.position.y + rectangle.height &&
    octagon.position.x + octagon.radius + octagon.velocity.x >=
      rectangle.position.x &&
    octagon.position.y + octagon.radius + octagon.velocity.y >=
      rectangle.position.y &&
    octagon.position.x - octagon.radius + octagon.velocity.x <=
      rectangle.position.x + rectangle.width
  );
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.w.pressed && lastKey === "w") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          octagon: {
            ...player,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = -5;
      }
    }
  } else if (keys.a.pressed && lastKey === "a") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          octagon: {
            ...player,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = -5;
      }
    }
  } else if (keys.s.pressed && lastKey === "s") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          octagon: {
            ...player,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else {
        player.velocity.y = 5;
      }
    }
  } else if (keys.d.pressed && lastKey === "d") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        circleCollidesWithRectangle({
          octagon: {
            ...player,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else {
        player.velocity.x = 5;
      }
    }
  }

  boundaries.forEach((boundary) => {
    boundary.draw();

    if (circleCollidesWithRectangle({ octagon: player, rectangle: boundary })) {
      //console.log("we are colliding");
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  });

  player.update();
}

animate();

window.addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
});

window.addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
