import { parseTemplateString } from "../src/stringTemplate";
import { resetTracking } from "../src/track";

function getConvertedValue(metric, target) {
  let value = getValue(metric, target);
  if (!value) return undefined;
  return convertValue(value, metric.type);
}

beforeEach(() => {
  window.evolv = { metrics: {} };
  resetTracking();
});

//

test("simple string ", () => {
  let str = "test1";
  expect(parseTemplateString(str)).toBe("test1");
});

test("string with context map", () => {
  let context = { val: "42", notval: "31" };
  let str = "test2";
  expect(parseTemplateString(str, context)).toBe("test2");
});

test("string with context map", () => {
  let context = { val: "42", notval: "31" };
  let str = "te${val}st";
  expect(parseTemplateString(str, context)).toBe("te42st");
});

test("string with context getValue", () => {
  let context = { test: { val: "41" } };
  let str = "te${test.val}}st";
  expect(parseTemplateString(str, context)).toBe("te41st");
});
