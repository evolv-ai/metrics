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
  metrics: {},
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


test('source is invalid', () => {
  window.val1 = 2;
  window.val2 = 7;

    let metric = {
      sorce: "expression", //typed incorrectly
      key: "window.val1",
      type: "number",
      tag: "test1",
      action: "bind"
    };

    processMetric(metric, {});

    //reqired because we have to delay due to our default GA integration
    jest.runAllTimers();

    expect(bind.mock.lastCall).toBe(undefined);
    expect(evolv.metrics.warnings.length).toBe(1)
});


test('source value is invalid', () => {
  window.val1 = 2;
  window.val2 = 7;

    let metric = {
      source: "expresion", //typed incorrectly
      key: "window.val1",
      type: "number",
      tag: "test1",
      action: "bind"
    };

    processMetric(metric, {});

    //reqired because we have to delay due to our default GA integration
    jest.runAllTimers();

    expect(bind.mock.lastCall).toBe(undefined);
    expect(evolv.metrics.warnings.length).toBe(1)
});
