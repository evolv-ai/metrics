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

let onFnc = function (event, cb) {
  if (event !== "valid") return;

  cb({ test: "data" }, { test: "data2" });
};

let promiseFnc = function (event) {
  return new Promise((resolve, reject) => {
    // console.info('validating promise')
    if (event === "valid") {
      // console.info('reached vald promise')
      resolve("data");
    } else {
      reject("no data");
    }
  });
};

test("async metric to not emit", () => {
  window.onFnc = onFnc;

  let metric = {
    source: "expression",
    key: "window.onFnc",
    on: "foo",
    tag: "test1",
    action: "event",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0);
});

test("async metric to emit", () => {
  window.onFnc = onFnc;

  let metric = {
    source: "expression",
    key: "window.onFnc",
    on: "valid",
    tag: "test2",
    action: "event",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("test2");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("async with this metric to emit", () => {
  window.onObj = {
    val: "this value",
    on(event, cb) {
      if (event !== "valid") return;
      if (this.val !== "this value") return;
      cb();
    },
  };

  let metric = {
    source: "expression",
    key: "window.onObj.on",
    on: "valid",
    tag: "test8",
    action: "event",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("test8");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("async promise metric to not emit", () => {
  window.promiseFnc = promiseFnc;

  let metric = {
    source: "expression",
    key: "window.promiseFnc:promise(then)",
    on: "foo",
    tag: "test3",
    action: "event",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0);
});

test("async promise metric to emit", () => {
  window.promiseFnc = promiseFnc;

  let metric = {
    source: "expression",
    key: "window.promiseFnc:promise(then)",
    on: "valid",
    tag: "test4",
    action: "event",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  //fix this before 1.0.0?
  // expect(event.mock.lastCall[0]).toBe('test4');
  // expect(evolv.metrics.executed.length).toBe(1)
});

// These are deprecated (expression supports async directly)
// However, we will support till we can migrate customers

test("on-async metric to not emit", () => {
  window.onObj = { on: onFnc };

  let metric = {
    source: "on-async",
    key: "window.onObj",
    on: "invalid",
    tag: "test6",
    action: "event",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0);
});

test("on-async metric to emit", () => {
  window.analytics = {};
  window.analytics.on = onFnc;
  let metric = {
    source: "on-async",
    key: "window.analytics",
    on: "valid",
    tag: "test7",
    action: "event",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("test7");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("on-async metric to bind", () => {
  window.analytics = {};
  window.analytics.on = onFnc;
  let metric = {
    source: "on-async",
    key: "window.analytics",
    on: "valid",
    extract: { expression: "params:at(0).test" },
    tag: "test10",
    action: "bind",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe("test10");
  expect(bind.mock.lastCall[1]).toBe("data");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("expression on metric to bind", () => {
  window.analytics = {};
  window.analytics.on = onFnc;
  let metric = {
    source: "expression",
    key: "window.analytics.on",
    on: "valid",
    extract: { expression: "params:at(0).test" },
    tag: "test22",
    action: "bind",
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe("test22");
  expect(bind.mock.lastCall[1]).toBe("data");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("on-async metric to emit conditionally", () => {
  window.analytics = {};
  window.analytics.on = onFnc;
  let metric = {
    source: "expression",
    key: "window.analytics.on",
    on: "valid",
    extract: { expression: "params:at(0).test" },
    apply: [
      {
        when: "data",
        action: "event",
        tag: "async21",
      },
    ],
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("async21");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("on-async metric to fail emit in layers conditionally", () => {
  window.analytics = {};
  window.analytics.on = onFnc;
  let metric = {
    source: "expression",
    key: "window.analytics.on",
    on: "valid",
    extract: { expression: "params:at(0).test" },
    apply: [
      {
        when: "data",
        action: "event",
        extract: { expression: "params:at(1).test" },
        apply: [
          {
            when: "data3",
            tag: "async22",
          },
        ],
      },
    ],
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0);
});

test("on-async metric to emit in layers conditionally", () => {
  window.analytics = {};
  window.analytics.on = onFnc;
  let metric = {
    source: "expression",
    key: "window.analytics.on",
    on: "valid",
    extract: { expression: "params:at(0).test" },
    apply: [
      {
        when: "data",
        action: "event",
        extract: { expression: "params:at(1).test" },
        apply: [
          {
            when: "data2",
            tag: "async23",
          },
        ],
      },
    ],
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("async23");
  expect(evolv.metrics.executed.length).toBe(1);
});

test("on-async metric to emit with dynamic tag", () => {
  window.analytics = {};
  window.analytics.on = onFnc;
  let metric = {
    source: "expression",
    key: "window.analytics.on",
    on: "valid",
    extract: { expression: "params:at(0).test" },
    apply: [
      {
        action: "event",
        tag: "segment-${params:at(0).test}",
      },
    ],
  };

  processMetric(metric, {});

  //reqired because we have to delay due to our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe("segment-data");
  expect(evolv.metrics.executed.length).toBe(1);
});
