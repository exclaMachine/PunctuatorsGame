export const shakeAndBorderizeArticle = (node) => {
  if (node.className === "the") {
    node.className = "laughing-article-the";
  }
  if (node.className === "a") {
    node.className = "laughing-article-a";
  }
  if (node.className === "an") {
    node.className = "laughing-article-an";
  }
};
