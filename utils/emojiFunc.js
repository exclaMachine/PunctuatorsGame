const emoticonEmojiHashMap = new Map();

emoticonEmojiHashMap.set(":)", "😀").set(":D", "😃").set(":(", "🙁");

export const changeEmoticonsToEmojis = (typedString) => {
  let splitWords = typedString.split(" ");

  splitWords.map((char, i) => {
    if (emoticonEmojiHashMap.has(char)) {
      splitWords[i] = emoticonEmojiHashMap.get(char);
    }
  });

  return splitWords.join(" ");
};
