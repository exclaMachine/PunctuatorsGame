import { wrapHomophones } from "./HomophonesFuncs.js";

describe("wrapHomophones", () => {
  it("wraps basic homophones", () => {
    const sentence = "I will add some sugar to my tea.";
    const expected =
      '<span id="Phonia (Homophones)" data-homophones="I,eye,aye" class="word-0">I</span> will <span id="Phonia (Homophones)" data-homophones="add,ad" class="word-0">add</span> <span id="Phonia (Homophones)" data-homophones="some,sum" class="word-0">some</span> sugar <span id="Phonia (Homophones)" data-homophones="to,too,two" class="word-0">to</span> my <span id="Phonia (Homophones)" data-homophones="tea,t,tee" class="word-0">tea</span>.';
    expect(wrapHomophones(sentence)).toBe(expected);
  });

  it("wraps multiple homophones in a sentence", () => {
    const sentence = "The air is tense today.";
    const expected =
      'The <span id="Phonia (Homophones)" data-homophones="air,ere,err,heir" class="word-0">air</span> is <span id="Phonia (Homophones)" data-homophones="tense,tents" class="word-0">tense</span> today.';
    expect(wrapHomophones(sentence)).toBe(expected);
  });

  it("does not wrap non-homophones", () => {
    const sentence = "The giraffe stretched her neck.";
    expect(wrapHomophones(sentence)).toBe(sentence); // the sentence should remain unchanged
  });
});
