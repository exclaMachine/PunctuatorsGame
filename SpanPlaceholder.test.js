const { applySpanPlaceholders } = require("./SpanPlaceholder.js");

describe("applySpanPlaceholders", () => {
  it("should handle text with a single span", () => {
    const input = 'This is a <span id="span1">test</span> string.';
    const { tempText, placeholders } = applySpanPlaceholders(input);
    expect(tempText).toBe("This is a PLACEHOLDER0 string.");
    expect(placeholders).toEqual(['<span id="span1">test</span>']);
  });

  it("should handle text with multiple spans with the same id", () => {
    const input =
      'This is <span id="span1">one</span> and <span id="span1">two</span>.';
    const { tempText, placeholders } = applySpanPlaceholders(input);
    expect(tempText).toBe("This is PLACEHOLDER0 and PLACEHOLDER1.");
    expect(placeholders).toEqual([
      '<span id="span1">one</span>',
      '<span id="span1">two</span>',
    ]);
  });

  it("should handle text with multiple spans with different ids", () => {
    const input =
      'Here is <span id="span1">first</span> and <span id="span2">second</span>.';
    const { tempText, placeholders } = applySpanPlaceholders(input);
    expect(tempText).toBe("Here is PLACEHOLDER0 and PLACEHOLDER1.");
    expect(placeholders).toEqual([
      '<span id="span1">first</span>',
      '<span id="span2">second</span>',
    ]);
  });

  it("should handle sentence with <span> tags and similar text content", () => {
    const sentence = "<span>ad</span> add ade";
    const { tempText, placeholders } = applySpanPlaceholders(sentence);
    expect(tempText).toBe("PLACEHOLDER0 add ade");
    expect(placeholders).toEqual(["<span>ad</span>"]);
  });

  it("should handle text with spans and additional HTML elements", () => {
    const input =
      '<p>Paragraph <span id="span1">and</span> span <b>bold</b>.</p>';
    const { tempText, placeholders } = applySpanPlaceholders(input);
    expect(tempText).toBe("<p>Paragraph PLACEHOLDER0 span <b>bold</b>.</p>");
    expect(placeholders).toEqual(['<span id="span1">and</span>']);
  });
});
