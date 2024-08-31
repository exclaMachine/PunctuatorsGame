function fetchWord(partOfSpeech) {
  return fetch(`https://api.datamuse.com/words?rel_jjb=${partOfSpeech}&max=1`)
    .then((response) => response.json())
    .then((data) => (data.length > 0 ? data[0].word : null));
}

async function createInterjection() {
  const adjective = await fetchWord("adj");
  const noun = await fetchWord("n");
  if (adjective && noun) {
    document.getElementById(
      "interjectionDisplay"
    ).innerText = `${adjective} ${noun}!`;
  } else {
    document.getElementById("interjectionDisplay").innerText =
      "Oops, something went wrong!";
  }
}

createInterjection().then((interjection) => {
  console.log(interjection);
});
