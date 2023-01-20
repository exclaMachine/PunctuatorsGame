//https://www.youtube.com/watch?v=8i2K7uwh124 drew conley speech text

let container = document.querySelector(".speech-bubble");

let speeds = {
  pause: 500,
  slow: 120,
  normal: 70,
  fast: 40,
};

let speechLines = [
  {
    string: "You found all the punctuation and capital letters!",
    speed: speeds.normal,
  },
  {
    string: "Refresh the page to play again!",
    speed: speeds.fast,
    classes: ["green"],
  },
];

let letterArray = [];
speechLines.forEach((line, index) => {
  if (index < speechLines.length - 1) {
    line.string += " ";
  }

  line.string.split("").forEach((letter) => {
    let span = document.createElement("span");
    span.textContent = letter;
    container.appendChild(span);
    letters.push({
      span: span,
      isSpace: chapacter === " ",
      delayAfter: line.speed,
      classes: line.classes || [],
    });
  });
});

let revealOneLetter = (list) => {
  let next = list.splice(0, 1)[0];
  next.span.classList.add("revealed");

  next.classes.forEach((c) => {
    next.span.classList.add(c);
  });

  let delay = next.isSpace ? 0 : next.delayAfter;

  if (list.length > 0) {
    setTimeout(function () {
      revealOneLetter(list);
    }, delay);
  }
};
