import { ipaWords } from "./ipa_words.js"; // Import IPA words from file

const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector("#scoreEl");
const ctx = canvas.getContext("2d");

const SPEED = 200;
const ENEMY_SPEED = 75;

const MAX_NUMBER_ROWS = 10;
const MAX_NUMBER_COLUMNS = 9;

const sound = {
  enemy: new Howl({
    src: ["../sounds/featherSwish.mp3"],
    loop: true,
    volume: 0.5,
  }),
  eat: new Howl({
    src: ["../sounds/projectile-hit/ana-eat.mp3"],
    volume: 0.5,
  }),
};

sound.enemy.on("load", () => {
  console.log("Enemy sound loaded");
});

function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function (...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

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
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }
}
canvas.height = Boundary.height * MAX_NUMBER_ROWS;
canvas.width = Boundary.width * MAX_NUMBER_COLUMNS;

function updateLettersUI() {
  const lettersContainer = document.getElementById("letters-container");
  lettersContainer.innerHTML = ""; // Clear existing boxes

  collectedLetters.forEach((letter, index) => {
    const box = document.createElement("div");
    box.classList.add("letter-box");

    // Check if the letter is in the correct position
    if (ipaLettersArray[index] === letter) {
      box.classList.add("correct");
    }

    box.textContent = letter || ""; // Display the letter
    lettersContainer.appendChild(box);
  });

  enableLetterSelection(); // Enable selection after updating the UI
  checkWordCompletion();
}

function calculatePlaybackRate(enemyY, playerY) {
  const maxRate = 1.5; // Maximum pitch
  const minRate = 0.5; // Minimum pitch
  const rateRange = maxRate - minRate;

  // Calculate the relative position
  const screenHeight = canvas.height;
  const relativePosition = (enemyY - playerY) / screenHeight;

  // Map the relative position to a playback rate
  return Math.max(minRate, Math.min(maxRate, 1 + relativePosition * rateRange));
}

function calculateDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

const proximityThreshold = 300; // Distance at which the sound starts

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

    const corners = []; // Store corner coordinates

    ctx.beginPath();

    // Draw the octagon and record corner positions
    for (let i = 0; i <= sides; i++) {
      const currentAngle = i * angle - rotationOffset;

      const x = centerX + this.radius * Math.cos(currentAngle);
      const y = centerY + this.radius * Math.sin(currentAngle);

      ctx.lineTo(x, y); // Draw the octagon edge

      if (i < sides) {
        corners.push({ x, y }); // Record corners except for the closing point
      }
    }

    ctx.closePath();
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Draw the hashtag shape inside the octagon
    ctx.beginPath();
    // Draw horizontal lines
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[5].x, corners[5].y);

    ctx.moveTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[4].x, corners[4].y);

    // Draw vertical lines
    ctx.moveTo(corners[3].x, corners[3].y);
    ctx.lineTo(corners[6].x, corners[6].y);

    ctx.moveTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[7].x, corners[7].y);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2; // Adjust line thickness if needed
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

    this.checkTransportOnVerticalAxis();
    this.checkTransportOnHorizontalAxis();
  }

  checkTransportOnVerticalAxis() {
    if (this.position.y + this.radius < 0) this.position.y = canvas.height;
    else if (this.position.y - this.radius > canvas.height) this.position.y = 0;
  }

  checkTransportOnHorizontalAxis() {
    if (this.position.x + this.radius < 0) this.position.x = canvas.width;
    else if (this.position.x - this.radius > canvas.width) this.position.x = 0;
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

    this.checkTransportOnVerticalAxis();
    this.checkTransportOnHorizontalAxis();
  }

  checkTransportOnVerticalAxis() {
    if (this.position.y + this.radius < 0) this.position.y = canvas.height;
    else if (this.position.y - this.radius > canvas.height) this.position.y = 0;
  }

  checkTransportOnHorizontalAxis() {
    if (this.position.x + this.radius < 0) this.position.x = canvas.width;
    else if (this.position.x - this.radius > canvas.width) this.position.x = 0;
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
    this.radius = 9; // Size of the letter (like pellets in Pac-Man)
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

class Item {
  constructor({ position, imgSrc = "./img/cherry.png" }) {
    this.position = position; // Position on the map
    this.radius = 8; // Size of the symbol (like pellets in Pac-Man)
    this.image = new Image(); // The IPA symbol
    this.image.src = imgSrc;
    this.loaded = false;

    this.image.onload = () => {
      this.loaded = true;
    };

    this.center = JSON.parse(JSON.stringify(position));
    this.radians = 0;
  }
  draw() {
    if (!this.loaded) return;

    ctx.drawImage(
      this.image,
      this.position.x - this.image.width / 2,
      this.position.y - this.image.height / 2
    );

    this.radians += 0.5;

    this.position.x = this.center.x + Math.cos(this.radians);
    this.position.y = this.center.y + Math.sin(this.radians);
  }
}

const boundaries = [];
const ipaLetters = [];
const powerUps = [];
let player = {};
let enemies = [];
let items = [];
let collectedLetters = [];

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
          x: Boundary.width * 1.5 * 5,
          y: Boundary.height * 6,
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
  ["^", ".", "[", "-", "]", ".", "[", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", "I", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "|"],
  ["|", ".", ".", " ", " ", "_", " ", ".", "|"],
  ["_", ".", "[", "]", " ", ".", " ", "[", "3"],
  [" ", ".", ".", " ", " ", "^", " ", ".", "."],
  ["^", ".", "b", ".", "[", "+", "]", ".", "^"],
  ["|", ".", ".", ".", " ", "_", " ", " ", "|"],
  ["|", ".", "1", "2", " ", "p", " ", "1", "8"],
  ["_", ".", "4", "5", "]", ".", "[", "5", "3"],
];

const randomWordKey =
  Object.keys(ipaWords)[
    Math.floor(Math.random() * Object.keys(ipaWords).length)
  ];
const ipaLettersArray = ipaWords[randomWordKey].split(" "); // Convert word's letters to an array
const totalPellets = 34; // Total spaces available for letters and blanks
const letterCount = ipaLettersArray.length; // Number of IPA letters in the word
const pelletsBetweenLetters = Math.floor(totalPellets / letterCount); // Blanks between each letter

let ipaIndex = 0; // Track current IPA letter
let blanksAdded = 0; // Track extra blanks added

// Debugging: Log the chosen word and its IPA letters
console.log(`Chosen word: ${randomWordKey}`);
console.log(`IPA letters array:`, ipaLettersArray);

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
      case ".": {
        // Determine if we should place an IPA letter or a blank pellet
        let letter;
        // Check if we're still within the number of IPA letters
        if (
          blanksAdded === 0 ||
          (blanksAdded >= pelletsBetweenLetters &&
            ipaIndex < ipaLettersArray.length)
        ) {
          letter = ipaLettersArray[ipaIndex]; // Place the next IPA letter
          ipaIndex++;
          blanksAdded = 1;
        } else {
          letter = " "; // Add a blank pellet
          blanksAdded++; // Count the blank added
        }
        ipaLetters.push(
          new IpaLetter({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
            letter: letter,
          })
        );
        break;
      }
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
      case "I":
        items.push(
          new Item({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2,
            },
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
      ipaLetters.splice(i, 1); // Remove the letter from the map

      // Add only non-blank letters to collectedLetters
      if (ipaLetter.letter.trim()) {
        collectedLetters.push(ipaLetter.letter);
      }
      updateLettersUI(); // Update the letter boxes
      score += 10;
      scoreEl.innerHTML = score;
    }
  }

  // for our items
  for (let i = items.length - 1; 0 <= i; i--) {
    const item = items[i];
    item.draw();
    // player collides with item
    if (
      Math.hypot(
        item.position.x - player.position.x,
        item.position.y - player.position.y
      ) <
      item.radius + player.radius
    ) {
      items.splice(i, 1);
      sound.eat.play();
      score += 50;
      scoreEl.innerHTML = score;
    }
  }

  //detect collision between enemies and player
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];

    const updateEnemySound = throttle((enemy) => {
      //Check if the enemy is still in the game
      if (!enemies.includes(enemy)) {
        console.log("here?");
        return;
      }

      const distance = calculateDistance(
        enemy.position.x,
        enemy.position.y,
        player.position.x,
        player.position.y
      );

      //console.log(distance);

      if (distance < proximityThreshold) {
        if (!sound.enemy.playing()) sound.enemy.play();

        // Calculate playback rate based on proximity
        const maxRate = 2.0; // Maximum playback rate
        const minRate = 0.8; // Minimum playback rate
        const rate = Math.max(
          minRate,
          maxRate - (distance / proximityThreshold) * (maxRate - minRate)
        );
        sound.enemy.rate(rate);

        // Stereo panning based on horizontal position
        const relativePan =
          (enemy.position.x - player.position.x) / canvas.width;
        sound.enemy.stereo(relativePan);

        // Volume adjustment based on proximity
        const maxVolume = 0.5;
        const minVolume = 0.1;
        const volume = Math.max(
          minVolume,
          maxVolume - distance / proximityThreshold
        );
        sound.enemy.volume(volume);
      } else {
        sound.enemy.stop();
      }
    }, 200); // Update every 200ms

    updateEnemySound(enemy);

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
        score += 50;
        scoreEl.innerHTML = score;
        sound.eat.play();
        //sound.enemy.stop();
        if (sound.enemy.playing()) {
          sound.enemy.stop();
        }
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
    giveInstructions();
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

// Add event listeners to arrow buttons
document.getElementById("up-arrow").addEventListener("pointerdown", () => {
  player.move("up");
});

document.getElementById("down-arrow").addEventListener("pointerdown", () => {
  player.move("down");
});

document.getElementById("left-arrow").addEventListener("pointerdown", () => {
  player.move("left");
});

document.getElementById("right-arrow").addEventListener("pointerdown", () => {
  player.move("right");
});

let firstSelectedIndex = null; // Track the first selected letter

function enableLetterSelection() {
  const letterBoxes = document.querySelectorAll(".letter-box");

  letterBoxes.forEach((box, index) => {
    box.addEventListener("click", () => {
      // If the box is already correct, do nothing
      if (box.classList.contains("correct")) return;

      // If this box is already selected, deselect it
      if (box.classList.contains("selected")) {
        box.classList.remove("selected");
        firstSelectedIndex = null;
        return;
      }

      // If no letter is selected yet, select this one
      if (firstSelectedIndex === null) {
        box.classList.add("selected");
        firstSelectedIndex = index;
      } else {
        // If a letter is already selected, swap with the current one
        const firstBox = letterBoxes[firstSelectedIndex];
        const secondBox = box;

        // Swap the letters in the boxes
        const temp = collectedLetters[firstSelectedIndex];
        collectedLetters[firstSelectedIndex] = collectedLetters[index];
        collectedLetters[index] = temp;

        // Update the UI
        updateLettersUI();

        // Reset selection
        firstSelectedIndex = null;
      }
    });
  });
}

function giveInstructions() {
  const instructionDisplay = document.createElement("div");
  instructionDisplay.id = "instructions";
  instructionDisplay.style.position = "absolute";
  instructionDisplay.style.top = "50%";
  instructionDisplay.style.left = "50%";
  instructionDisplay.style.transform = "translate(-50%, -50%)";
  instructionDisplay.style.color = "white";
  instructionDisplay.style.fontSize = "24px";
  instructionDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  instructionDisplay.style.padding = "10px";
  instructionDisplay.style.borderRadius = "5px";
  instructionDisplay.innerText = "Rearrange the IPA Letters at the top ";

  document.body.appendChild(instructionDisplay);
}

function checkWordCompletion() {
  let instructionDisplay = document.getElementById("instructions");

  // Ensure all collected letters are correct and in the correct order
  const isComplete =
    collectedLetters.length === ipaLettersArray.length &&
    collectedLetters.every(
      (letter, index) => letter === ipaLettersArray[index]
    );

  if (isComplete) {
    if (instructionDisplay != null) instructionDisplay.remove();
    const wordDisplay = document.createElement("div");
    wordDisplay.id = "completed-word";
    wordDisplay.style.position = "absolute";
    wordDisplay.style.top = "50%";
    wordDisplay.style.left = "50%";
    wordDisplay.style.transform = "translate(-50%, -50%)";
    wordDisplay.style.color = "white";
    wordDisplay.style.fontSize = "24px";
    wordDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    wordDisplay.style.padding = "10px";
    wordDisplay.style.borderRadius = "5px";
    wordDisplay.innerText = `Word Completed: ${randomWordKey}`;

    document.body.appendChild(wordDisplay);
  }
}
