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

function highlightAndClassifyArticles(str) {
  return str.replace(
    /\b(the|an|a)\b(\s*\w?)/gi,
    function (match, article, nextChar) {
      let dataAlternate;
      switch (article.toLowerCase()) {
        case "a":
        case "an":
          dataAlternate = "the";
          break;
        case "the":
          if (nextChar && "aeiouAEIOU".includes(nextChar.trim())) {
            dataAlternate = "an";
          } else {
            dataAlternate = "a";
          }
          break;
      }

      // Match the case
      if (article.charAt(0) === article.charAt(0).toUpperCase()) {
        dataAlternate =
          dataAlternate.charAt(0).toUpperCase() + dataAlternate.slice(1);
      }

      return `<span data-alternate="${dataAlternate}">${article}</span>${nextChar}`;
    }
  );
}

// Example usage:
// const inputString = "A cat and an owl sat on the roof. The apple is sweet.";
// const outputString = highlightAndClassifyArticles(inputString);
// console.log(outputString);
