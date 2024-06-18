
import { processMetric } from "../src/metric";
import { resetTracking } from "../src/track";
import { resetObservables } from "../src/observables";

var event = jest.fn(x=>x);
var bind = jest.fn(x=>x);
var get = jest.fn(()=>undefined);
var scope = jest.fn(()=>undefined);
var collect = jest.fn(()=>({scope}));

let evolv = window.evolv = {
  client: {emit: event},
  context: {set: bind, get},
  collect
};

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

test('single metric to bind', () => {
  window.testValue = 5;

  let metric = {
    source: "expression",
    key: "window.testValue",
    tag: "test",
    type: "number",
    action: "bind"
  };

  processMetric(metric, {});

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe(5);
  expect(evolv.metrics.executed.length).toBe(1)
});

test('inheritance', () => {
  window.testValue = "avail";

  let context = {
    source: "expression",
    key: "window.testValue",
  };

  let metric = {
    tag: "test",
    action: "bind"
  };

  processMetric(metric, context);

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('avail');
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test inheritance with when', () => {
  window.testValue = "avail";

  let context = {
    source: "expression",
    key: "window.testValue",
  };

  let metric = {
    when: 'avail',
    value: '5',
    tag: "test",
    action: "bind"
  };

  processMetric(metric, context);

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('5');
  expect(evolv.metrics.executed.length).toBe(1)
});


test('single metric to bind with cookie and map', () => {
  window.document.cookie = "test=ctest";

  let metric = {
    source: "cookie",
    key: "test",
    tag: "test",
    action: "bind",
    map:[
        {when: "ctest", value: "first"}
    ]
  };

  processMetric(metric, {});

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('first');
  expect(evolv.metrics.executed.length).toBe(1)
});

test('single metric to bind with cookie and map boolean with inheritance (dtv scenario)', () => {
  window.document.cookie = "test=ctest";

  let metric = {
    "source": "cookie",
    "key": "test",
     action: "bind",
    "apply": [
      {
        tag: "test.cookieFound",
        type: "boolean",
        "default": false,
        map:[
          {when: "ctest", value: true}
        ]
      }
    ]
  };

  processMetric(metric, {});

  expect(bind.mock.lastCall[0]).toBe('test.cookieFound');
  expect(bind.mock.lastCall[1]).toBe(true);
  expect(evolv.metrics.executed.length).toBe(1)
});

test('single metric to bind with cookie and map boolean', () => {
  let metric = {
    action: "bind",
    "apply": [
      {
        source: "cookie",
        key: "test-notfound",
        // "apply": [
        //   {
            tag: "test.cookienotfound",
            type: "boolean",
            "default": false,
            map:[
              {when: ".+", value: true}
            ]
        //   }
        // ]
      }
    ]
  };

  processMetric(metric, {});

  expect(bind.mock.lastCall[0]).toBe('test.cookienotfound');
  expect(bind.mock.lastCall[1]).toBe(false);
  expect(evolv.metrics.executed.length).toBe(1)
});

test('single metric to bind with cookie and map boolean with inheritance and wild card (dtv scenario)', () => {
  window.document.cookie = "test=ctest";

  let metric = {
    action: "bind",
    "apply": [
      {
        "source": "cookie",
        "key": "test",
        "apply": [
          {
            tag: "test.cookieFound",
            type: "boolean",
            "default": false,
            map:[
              {when: ".+", value: true}
            ]
          }
        ]
      }
    ]
  };

  processMetric(metric, {});

  expect(bind.mock.lastCall[0]).toBe('test.cookieFound');
  expect(bind.mock.lastCall[1]).toBe(true);
  expect(evolv.metrics.executed.length).toBe(1)
});
