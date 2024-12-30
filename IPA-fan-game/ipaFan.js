const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector("#scoreEl");
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

class Enemy {
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.radius = 16;
  }

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
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class IpaLetter {
  constructor({ position, letter }) {
    this.position = position; // Position on the map
    this.radius = 8; // Size of the letter (like pellets in Pac-Man)
    this.letter = letter; // The IPA letter
    this.color = "white"; // Default color for the letters
  }

  draw(ctx) {
    // Draw the letter as a circle
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    // Draw the letter inside the circle
    ctx.fillStyle = "black"; // Letter color
    ctx.font = "16px Arial"; // Font size and style
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.letter, this.position.x, this.position.y);
  }
}

const boundaries = [];
const ipaLetters = [];
const enemies = [
  new Enemy({
    position: {
      x: Boundary.width * 1.5 * 6,
      y: Boundary.height * 1.5,
    },
    velocity: {
      x: -5,
      y: 0,
    },
  }),
];

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
let score = 0;

function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

const map = [
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", "p", "|"],
  ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "3"],
];

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
      case "1":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner1.png"),
          })
        );
        break;
      case "2":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner2.png"),
          })
        );
        break;
      case "3":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner3.png"),
          })
        );
        break;
      case "4":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner4.png"),
          })
        );
        break;
      case "b":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/block.png"),
          })
        );
        break;
      case "[":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capLeft.png"),
          })
        );
        break;
      case "]":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capRight.png"),
          })
        );
        break;
      case "_":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capBottom.png"),
          })
        );
        break;
      case "^":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/capTop.png"),
          })
        );
        break;
      case "+":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeCross.png"),
          })
        );
        break;
      case "5":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorTop.png"),
          })
        );
        break;
      case "6":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorRight.png"),
          })
        );
        break;
      case "7":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            color: "blue",
            image: createImage("./img/pipeConnectorBottom.png"),
          })
        );
        break;
      case "8":
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height,
            },
            image: createImage("./img/pipeConnectorLeft.png"),
          })
        );
        break;
      case ".":
        ipaLetters.push(
          new IpaLetter({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
            letter: "æ",
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

  for (let i = ipaLetters.length - 1; i > 0; i--) {
    const ipaLetter = ipaLetters[i];
    ipaLetter.draw(ctx);

    if (
      Math.hypot(
        ipaLetter.position.x - player.position.x,
        ipaLetter.position.y - player.position.y
      ) <
      ipaLetter.radius + player.radius
    ) {
      ipaLetters.splice(i, 1);
      score += 10;
      scoreEl.innerHTML = score;
    }
  }

  player.update();

  enemies.forEach((enemy) => {
    enemy.update();

    const collisions = [];
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes("right") &&
        circleCollidesWithRectangle({
          octagon: {
            ...enemy,
            velocity: {
              x: 5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("right");
      }

      if (
        !collisions.includes("left") &&
        circleCollidesWithRectangle({
          octagon: {
            ...enemy,
            velocity: {
              x: -5,
              y: 0,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("left");
      }

      if (
        !collisions.includes("up") &&
        circleCollidesWithRectangle({
          octagon: {
            ...enemy,
            velocity: {
              x: 0,
              y: -5,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("up");
      }

      if (
        !collisions.includes("down") &&
        circleCollidesWithRectangle({
          octagon: {
            ...enemy,
            velocity: {
              x: 0,
              y: 5,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("down");
      }
    });
    console.log(collisions);
  });
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
