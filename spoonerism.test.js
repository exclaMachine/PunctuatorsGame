import { spoonerism } from "./spoonerismFunc.js";

describe("spoonerism function tests", () => {
  it("should correctly wrap consonant clusters at the beginning of words", () => {
    const input = "That's a cool trick, young friend!";
    const output = spoonerism(input);
    expect(output).toBe(
      '<span id="The Foon (Spoonerism)" class="Th">Th</span>at\'s a <span id="The Foon (Spoonerism)" class="c">c</span>ool <span id="The Foon (Spoonerism)" class="tr">tr</span>ick, <span id="The Foon (Spoonerism)" class="y">y</span>oung <span id="The Foon (Spoonerism)" class="fr">fr</span>iend!'
    );
  });

  it("should not wrap consonant clusters after apostrophes", () => {
    const input = "She's a friend.";
    const output = spoonerism(input);
    expect(output).toBe(
      '<span id="The Foon (Spoonerism)" class="Sh">Sh</span>e\'s a <span id="The Foon (Spoonerism)" class="fr">fr</span>iend.'
    );
  });

  it('should wrap the letter "y" when it starts a word', () => {
    const input = "Yellow yaks are young.";
    const output = spoonerism(input);
    expect(output).toBe(
      '<span id="The Foon (Spoonerism)" class="Y">Y</span>ellow <span id="The Foon (Spoonerism)" class="y">y</span>aks are <span id="The Foon (Spoonerism)" class="y">y</span>oung.'
    );
  });

  it('surrounds initial consonant clusters with span but ignores "y" when it follows another consonant', () => {
    const input = "Try to fly";
    const output = spoonerism(input);
    expect(output).toBe(
      '<span id="The Foon (Spoonerism)" class="Tr">Tr</span>y <span id="The Foon (Spoonerism)" class="t">t</span>o <span id="The Foon (Spoonerism)" class="fl">fl</span>y'
    );
  });
});
