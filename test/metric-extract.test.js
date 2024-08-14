import { processMetric } from "../src/metric";
import { resetTracking } from "../src/track";
import { resetObservables } from "../src/observables";

var event = jest.fn((x) => x);
var bind = jest.fn((x) => x);
var get = jest.fn(() => undefined);
var scope = jest.fn(() => undefined);
var collect = jest.fn(() => ({ scope }));

let evolv = (window.evolv = {
  client: { emit: event },
  context: { set: bind, get },
  collect,
});

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  resetTracking();
  resetObservables();
});

beforeEach(() => {
  resetTracking();
});

test("test storage extraction to be used in bind", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 34}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: "mydata.value" },
    action: "bind",
    tag: "mydata-value",
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe("mydata-value");
  expect(bind.mock.lastCall[1]).toBe(34);
  expect(evolv.metrics.executed.length).toBe(1);
});

test("test storage extraction to be used by nested bind", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 36}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: "mydata.value" },
    apply: [
      {
        action: "bind",
        tag: "mydata-value",
      },
    ],
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe("mydata-value");
  expect(bind.mock.lastCall[1]).toBe(36);
  expect(evolv.metrics.executed.length).toBe(1);
});

test("test storage extraction to be used by nested bind", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 36}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: "mydata.value" },
    apply: [
      {
        when: 36,
        action: "bind",
        tag: "mydata-value",
      },
    ],
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe("mydata-value");
  expect(bind.mock.lastCall[1]).toBe(36);
  expect(evolv.metrics.executed.length).toBe(1);
});

test("test storage extraction to fail on when for nested bind", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 36}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: "mydata.value" },
    apply: [
      {
        when: 37,
        action: "bind",
        tag: "mydata-value",
      },
    ],
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(bind.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0);
});

test("test storage extraction to fire  event", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": "35"}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    action: "event",
    tag: "my-storage-event1",
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("my-storage-event1");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("test storage extraction to fire  event", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": "35"}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "string",
    extract: { expression: "mydata.value" },
    action: "event",
    tag: "my-storage-event2",
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("my-storage-event2");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("test storage extraction to fire  event", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 35}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: "mydata.value" },
    action: "event",
    tag: "my-storage-event3",
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("my-storage-event3");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("test storage extraction to be used by extra layers for conditions", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 34}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: "mydata.value" },
    apply: [
      {
        when: 34,
        apply: [
          {
            action: "event",
            tag: "my-storage-event4",
          },
        ],
      },
    ],
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("my-storage-event4");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("test storage extraction to be used by extra layers for conditions", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 34}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: "mydata.value" },
    apply: [
      {
        when: 34,
        action: "event",
        tag: "my-storage-event5",
      },
    ],
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("my-storage-event5");
  expect(evolv.metrics.executed.length).toBe(1);
});


test("test storage extraction to be used by extra layers for conditions with failure", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 34}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: "mydata.value" },
    apply: [
      {
        when: 32,
        action: "event",
        tag: "my-storage-event6",
      },
    ],
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0);
});


test("test storage extraction to count base array", () => {
  window.localStorage.setItem("testNested", '["mydata", {"value": 36}, "secondvalue"]');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: ":count"},//"mydata.value" },
    apply: [
      {
        action: "bind",
        tag: "mydata-value",
      },
    ],
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('mydata-value');
  expect(bind.mock.lastCall[1]).toBe(3);
  expect(evolv.metrics.executed.length).toBe(1);
});

test("test storage extraction to count base values", () => {
  window.localStorage.setItem("testNested", '{"mydata": {"value": 36}, "secondvalue": {}}');

  let context = {
    source: "localStorage",
    key: "testNested",
    type: "number",
    extract: { expression: ":values:count"},//"mydata.value" },
    apply: [
      {
        action: "bind",
        tag: "mydata-value",
      },
    ],
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('mydata-value');
  expect(bind.mock.lastCall[1]).toBe(2);
  expect(evolv.metrics.executed.length).toBe(1);
});
