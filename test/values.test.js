import { convertValue, getValue } from "../src/values";
import { resetTracking } from "../src/track";

window.evolv = {
  metrics: {},
};

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  resetTracking();
  // resetObservables();
});

beforeEach(() => {
  resetTracking();
});

function getConvertedValue(metric, target) {
  let value = getValue(metric, target);
  if (!value) return undefined;
  return convertValue(value, metric.type);
}

// source retrievals
// other values tests are split into different files

test("explicit string value", () => {
  let metric = { value: "test" };
  expect(getConvertedValue(metric)).toBe("test");
});

test("explicit number value", () => {
  let metric = { value: 5, type: "number" };
  expect(getConvertedValue(metric)).toBe(5);
});

test("explicit number value", () => {
  let metric = { value: true, type: "boolean" };
  expect(getConvertedValue(metric)).toBe(true);
});

test("extensions supported", () => {
  let metric = { source: "extension", key: "distribution", type: "number" };
  expect(getConvertedValue(metric)).toBeGreaterThanOrEqual(0);
  expect(getConvertedValue(metric)).toBeLessThan(100);
});
