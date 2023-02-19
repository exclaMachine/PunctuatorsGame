export const shakeAndBorderizeArticle = (node) => {
  if (node.className === "article the") {
    node.className = "laughing-article-the";
  }
  if (node.className === "article a") {
    node.className = "laughing-article-a";
  }
};
