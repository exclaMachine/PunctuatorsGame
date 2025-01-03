const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector("#scoreEl");
const ctx = canvas.getContext("2d");

const SPEED = 200;
const ENEMY_SPEED = 75;

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
    this.position = position; // Position of the octagon's center
    this.velocity = velocity; // Movement velocity
    this.radius = 16; // Radius of the octagon
    this.isMouthOpen = true; // Initial state of the mouth
    this.mouthTimer = 0; // Timer to control mouth alternation
    this.desiredDirection = {
      x: 0,
      y: 0,
    };
    this.state = "active";
  }

  draw() {
    const centerX = this.position.x;
    const centerY = this.position.y;

    const sides = 8; // Number of sides for the octagon
    const angle = (Math.PI * 2) / sides; // Angle between vertices
    const rotationOffset = angle / 2; // Align the flat side at the bottom

    ctx.beginPath();

    // Draw the octagon
    for (let i = 0; i <= sides; i++) {
      const currentAngle = i * angle - rotationOffset;

      const x = centerX + this.radius * Math.cos(currentAngle);
      const y = centerY + this.radius * Math.sin(currentAngle);

      ctx.lineTo(x, y); // Draw the octagon edge
    }

    ctx.closePath();
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Determine the mouth position based on velocity
    let squareX = centerX; // Default to center
    let squareY = centerY; // Default to center

    const squareSize = this.radius; // Make the square 1/4th the size of the octagon
    const squareOffset = this.radius / 1.5; // Offset to align the square with the corners

    if (this.velocity.y < 0) {
      // Moving upward, place square in the upper-right corner
      squareX += squareOffset;
      squareY -= squareOffset;
    } else if (this.velocity.x < 0) {
      // Moving left, place square in the lower-left corner
      squareX -= squareOffset;
      squareY += squareOffset;
    } else {
      // Default (moving right or stationary), place square in the lower-right corner
      squareX += squareOffset;
      squareY += squareOffset;
    }

    // If the mouth is open, draw the black rectangle
    if (this.isMouthOpen) {
      ctx.fillStyle = "black";
      ctx.fillRect(
        squareX - squareSize / 2, // Adjust to center the square at the corner
        squareY - squareSize / 2,
        squareSize, // Width of the black rectangle
        squareSize // Height of the black rectangle
      );
    }
  }

  move(direction) {
    switch (direction) {
      case "up":
        this.desiredDirection = {
          x: 0,
          y: -1,
        };
        break;
      case "down":
        this.desiredDirection = {
          x: 0,
          y: 1,
        };
        break;
      case "left":
        this.desiredDirection = {
          x: -1,
          y: 0,
        };
        break;
      case "right":
        this.desiredDirection = {
          x: 1,
          y: 0,
        };
        break;
    }
  }

  collision(boundaries) {
    for (const boundary of boundaries) {
      if (
        circleCollidesWithRectangle({
          octagon: this,
          rectangle: boundary,
        })
      )
        return true;
    }
    return false;
  }

  snapToGrid() {
    const CELL_SIZE = 20;
    this.position = {
      x: Math.round(this.position.x / CELL_SIZE) * CELL_SIZE,
      y: Math.round(this.position.y / CELL_SIZE) * CELL_SIZE,
    };
  }

  isValidMove(boundaries) {
    const PIXEL_BUFFER = 5;
    for (const boundary of boundaries) {
      if (
        circleCollidesWithRectangle({
          octagon: {
            ...this,
            velocity: {
              x: this.desiredDirection.x * PIXEL_BUFFER,
              y: this.desiredDirection.y * PIXEL_BUFFER,
            },
          },
          rectangle: boundary,
        })
      )
        return false;
    }
    return true;
  }

  movePlayerWithInput(delta, boundaries) {
    if (this.isValidMove(boundaries)) {
      this.velocity.x = this.desiredDirection.x;
      this.velocity.y = this.desiredDirection.y;
    }

    // Update position
    if (this.collision(boundaries)) {
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.snapToGrid();
    } else {
      this.position.x += this.velocity.x * delta * SPEED;
      this.position.y += this.velocity.y * delta * SPEED;
    }

    // Control mouth alternation
    this.mouthTimer++;
    if (this.mouthTimer > 15) {
      // Change state every 15 frames
      this.isMouthOpen = !this.isMouthOpen;
      this.mouthTimer = 0;
    }
  }

  die() {
    this.state = "initDeath";
    gsap.to(this, {
      radians: Math.PI - 0.00000001,
      onComplete: () => {
        setTimeout(() => {
          game.init();
        }, 750);
      },
    });
    console.log("die");
  }

  update(delta, boundaries) {
    this.draw();

    switch (this.state) {
      case "active":
        this.movePlayerWithInput(delta, boundaries);
        break;
      case "initDeath":
        this.state = "death";
        break;
    }
  }
}

class Enemy {
  static speed = 1;
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.color = color;
    this.prevCollisions = [];
    this.radius = 16;
    this.speed = 2;
    this.scared = false;
    this.previousValidMoves = [];
    this.state = "active";
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
    ctx.fillStyle = this.scared ? "blue" : this.color;
    ctx.fill();
  }

  collision(boundaries) {
    for (const boundary of boundaries) {
      if (
        circleCollidesWithRectangle({
          octagon: this,
          rectangle: boundary,
        })
      )
        return true;
    }
    return false;
  }

  snapToGrid() {
    const CELL_SIZE = 20;
    this.position = {
      x: Math.round(this.position.x / CELL_SIZE) * CELL_SIZE,
      y: Math.round(this.position.y / CELL_SIZE) * CELL_SIZE,
    };
  }

  gatherValidMoves(boundaries) {
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    //filter out the opposite direction
    const validMoves = directions.filter((direction) => {
      const oppositeDirection = { x: -this.velocity.x, y: -this.velocity.y };

      return (
        direction.x !== oppositeDirection.x ||
        direction.y !== oppositeDirection.y
      );
    });

    const PIXEL_BUFFER = 5;
    for (const boundary of boundaries) {
      for (const direction of directions) {
        if (
          circleCollidesWithRectangle({
            octagon: {
              ...this,
              velocity: {
                x: direction.x * PIXEL_BUFFER,
                y: direction.y * PIXEL_BUFFER,
              },
            },
            rectangle: boundary,
          })
        ) {
          //splice out the direction from our validMoves array
          validMoves.splice(
            validMoves.findIndex(
              (move) => move.x === direction.x && move.y === direction.y
            ),
            1
          );
        }
      }
    }
    return validMoves;
  }

  move(delta, boundaries) {
    const validMoves = this.gatherValidMoves(boundaries);
    if (
      validMoves.length > 0 &&
      validMoves.length !== this.previousValidMoves.length
    ) {
      //change ghosts velocity
      const chosenMove =
        validMoves[Math.floor(Math.random() * validMoves.length)];

      this.velocity.x = chosenMove.x;
      this.velocity.y = chosenMove.y;
    }

    // Update position
    if (this.collision(boundaries)) {
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.snapToGrid();
    } else {
      this.position.x += this.velocity.x * delta * ENEMY_SPEED;
      this.position.y += this.velocity.y * delta * ENEMY_SPEED;
    }

    this.previousValidMoves = validMoves;
  }

  update(delta, boundaries) {
    this.draw();

    switch (this.state) {
      case "active":
        this.move(delta, boundaries);
        break;
    }
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

class PowerUp {
  constructor({ position, symbol }) {
    this.position = position; // Position on the map
    this.radius = 12; // Size of the symbol (like pellets in Pac-Man)
    this.symbol = symbol; // The IPA symbol
    this.color = "white"; // Default color for the symbols
  }

  draw(ctx) {
    // Draw the symbol as a circle
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();

    // Draw the symbol inside the circle
    ctx.fillStyle = "black"; // Letter color
    ctx.font = "16px Arial"; // Font size and style
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.symbol, this.position.x, this.position.y);
  }
}

const boundaries = [];
const ipaLetters = [];
const powerUps = [];
let player = {};
let enemies = [];

const game = {
  init() {
    player = new Player({
      position: {
        x: Boundary.width * 1.5,
        y: Boundary.height * 1.5,
      },
      velocity: {
        x: 0,
        y: 0,
      },
    });
    enemies = [
      new Enemy({
        position: {
          x: Boundary.width * 1.5 * 4,
          y: Boundary.height * 1.5,
        },
        velocity: {
          x: Enemy.speed,
          y: 0,
        },
      }),
      //   new Enemy({
      //     position: {
      //       x: Boundary.width * 2,
      //       y: Boundary.height * 1.5 * 3,
      //     },
      //     velocity: {
      //       x: Enemy.speed,
      //       y: 0,
      //     },
      //     color: "pink",
      //   }),
    ];
  },
};

game.init();

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
      case "p":
        powerUps.push(
          new PowerUp({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
            symbol: "!",
          })
        );
        break;
    }
  });
});

function circleCollidesWithRectangle({ octagon, rectangle }) {
  //need this to calculate black space between octagon and boundary
  const padding = Boundary.width / 2 - octagon.radius - 2;
  return (
    octagon.position.y - octagon.radius + octagon.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    octagon.position.x + octagon.radius + octagon.velocity.x >=
      rectangle.position.x - padding &&
    octagon.position.y + octagon.radius + octagon.velocity.y >=
      rectangle.position.y - padding &&
    octagon.position.x - octagon.radius + octagon.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  );
}

let animationId;
let prevMs = Date.now();

function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const currentMs = Date.now();
  const delta = (currentMs - prevMs) / 1000;
  prevMs = currentMs;

  if (keys.w.pressed && lastKey === "w") {
    player.move("up");
  } else if (keys.a.pressed && lastKey === "a") {
    player.move("left");
  } else if (keys.s.pressed && lastKey === "s") {
    player.move("down");
  } else if (keys.d.pressed && lastKey === "d") {
    player.move("right");
  }

  boundaries.forEach((boundary) => {
    boundary.draw();

    // if (circleCollidesWithRectangle({ octagon: player, rectangle: boundary })) {
    //   //console.log("we are colliding");
    //   player.velocity.x = 0;
    //   player.velocity.y = 0;
    // }
  });

  for (let i = ipaLetters.length - 1; i >= 0; i--) {
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

  //detect collision between enemies and player
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (
      Math.hypot(
        enemy.position.x - player.position.x,
        enemy.position.y - player.position.y
      ) <
        enemy.radius + player.radius &&
      player.state === "active"
    ) {
      if (enemy.scared) {
        enemies.splice(i, 1);
      } else {
        //cancelAnimationFrame(animationId);
        player.die();
        enemies.forEach((enemy) => {
          enemy.state = "paused";
        });
        console.log("You lose");
      }
    }
  }

  //win condition
  if (ipaLetters.length === 0) {
    cancelAnimationFrame(animationId);
    console.log("You Win!");
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.draw(ctx);

    if (
      Math.hypot(
        powerUp.position.x - player.position.x,
        powerUp.position.y - player.position.y
      ) <
      powerUp.radius + player.radius
    ) {
      powerUps.splice(i, 1);

      //make enemies scared TODO different powerups based on punctuation?
      enemies.forEach((enemy) => {
        enemy.scared = true;

        setTimeout(() => {
          enemy.scared = false;
        }, 6000);
      });
    }
  }

  player.update(delta, boundaries);

  enemies.forEach((enemy) => {
    enemy.update(delta, boundaries);

    const collisions = [];
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes("right") &&
        circleCollidesWithRectangle({
          octagon: {
            ...enemy,
            velocity: {
              x: enemy.speed,
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
              x: -enemy.speed,
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
              y: -enemy.speed,
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
              y: enemy.speed,
            },
          },
          rectangle: boundary,
        })
      ) {
        collisions.push("down");
      }
    });

    if (collisions.length > enemy.prevCollisions.length)
      enemy.prevCollisions = collisions;

    if (JSON.stringify(collisions) !== JSON.stringify(enemy.prevCollisions)) {
      if (enemy.velocity.x > 0) enemy.prevCollisions.push("right");
      else if (enemy.velocity.x < 0) enemy.prevCollisions.push("left");
      else if (enemy.velocity.y < 0) enemy.prevCollisions.push("up");
      else if (enemy.velocity.y > 0) enemy.prevCollisions.push("down");

      const pathways = enemy.prevCollisions.filter((collision) => {
        return !collisions.includes(collision);
      });
      //console.log({ pathways });

      const direction = pathways[Math.floor(Math.random() * pathways.length)];

      switch (direction) {
        case "down":
          enemy.velocity.y = enemy.speed;
          enemy.velocity.x = 0;
          break;
        case "up":
          enemy.velocity.y = -enemy.speed;
          enemy.velocity.x = 0;
          break;
        case "right":
          enemy.velocity.y = 0;
          enemy.velocity.x = enemy.speed;
          break;
        case "left":
          enemy.velocity.y = 0;
          enemy.velocity.x = -enemy.speed;
          break;
      }
      enemy.prevCollisions = [];
    }
    //console.log(collisions);
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
