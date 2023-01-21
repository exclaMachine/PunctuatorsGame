//https://www.youtube.com/watch?v=8i2K7uwh124 drew conley speech text

export let textRevealSpeeds = {
  pause: 500,
  slow: 120,
  normal: 70,
  fast: 40,
};

export let changeTextToSpeechBubble = (speechLines, htmlElement) => {
  let letterArray = [];
  speechLines.forEach((line, index) => {
    if (index < speechLines.length - 1) {
      line.string += " ";
    }

    line.string.split("").forEach((letter) => {
      let span = document.createElement("span");
      span.textContent = letter;
      htmlElement.appendChild(span);
      letterArray.push({
        span: span,
        isSpace: letter === " ",
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

  revealOneLetter(letterArray);
};
