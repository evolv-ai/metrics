
import { processMetric } from "../src/metric";
import { Observables } from "../src/observables";
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

test('test bind with poll', () => {
  window.testValue = undefined;

  let context = {
  };

  let metric = {
    source: "expression",
    key: "window.testValue",
    tag: "test",
    action: "bind",
    poll: {duration: 500}
  };

  processMetric(metric, context);

  expect(bind.mock.lastCall).toBe(undefined);

  window.testValue = 'after-test';
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('after-test');
  expect(evolv.metrics.executed.length).toBe(1)
});


test('test polling context with when and 2 layers', () => {  
  window.testValue = undefined;

  let metric = {
    when: 'avail',
    value: '5',
    tag: "test",
    action: "bind"
  };
  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [metric],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(bind.mock.lastCall).toBe(undefined);

  window.testValue = "avail";
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('5');
  expect(evolv.metrics.executed.length).toBe(1)
});


test('test polling context with when and 3 layers', () => {  
  window.testValue = undefined;
  let metric = {
    value: '5',
    tag: "test",
    action: "bind"
  };
  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [{when: 'avail', apply:[metric]}],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(bind.mock.lastCall).toBe(undefined);

  window.testValue = "avail";
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('5');
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test polling context with no match', () => { 
 
  window.testValue = undefined;

  let metric = {
    when: 'notavail',
    value: '4',
    tag: "test",
    action: "bind"
  };
  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [metric],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(bind.mock.lastCall).toBe(undefined);

  window.testValue = "avail";
  jest.runAllTimers();

  expect(bind.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0)
});

test('test polling context with no match', () => {  
  console.info('testing with no match');

  window.testValue = undefined;

  let metric = {
    when: 'notavail',
    value: '4',
    tag: "test",
    action: "bind"
  };
  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [metric],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(bind.mock.lastCall).toBe(undefined);

  window.testValue = "avail";
  jest.runAllTimers();

  expect(bind.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0)
});


test('test polling context with one match and one no match', () => {  
  window.testValue = undefined;

  let metric = {
    when: 'avail',
    value: '5',
    tag: "test",
    action: "bind"
  };
  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [{...metric,when:'notavail', value: '4'}, metric],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(bind.mock.lastCall).toBe(undefined);

  window.testValue = "avail";
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('5');
  expect(evolv.metrics.executed.length).toBe(1)
});


test('single metric to emit', () => {
  window.testValue = "avail";

  let metric = {
    when: 'avail',
    tag: "test",
    action: "event"
  };

  let context = {
    source: "expression",
    key: "window.testValue",
    apply: [metric]
  };

  processMetric(metric, context);

  //reqired because we have to delay because of our default GA integration
  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test');
  expect(evolv.metrics.executed.length).toBe(1)
});


// to test eval_now
test('test polling context with extra layer for conditions', () => { 
  window.testValue = undefined;
  window.testSecondValue = "test";

  let metric = {
    when: "test",
    tag: "test5",
  };
  let context = {
    source: "expression",
    "action": "event",
    key: "window.testValue",
    apply: [
      { 
        "key": "window.testSecondValue",
        apply:[metric]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test5');
});

test('test polling context with extra layer for conditions', () => { 
  window.testValue = undefined;
  window.testSecondValue = "test";

  let metric = {
    when: "test",
    tag: "test6",
  };
  let context = {
    source: "expression",
    "action": "event",
    key: "window.testValue",
    eval_now: true,
    apply: [
      { 
        "key": "window.testSecondValue",
        apply:[metric]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)
});

test('test polling context with extra layer for conditions', () => { 
  window.testValue = undefined;
  window.testSecondValue = "test";

  let metric = {
    when: "test",
    tag: "test7",
  };
  let context = { 
    source: "expression",
    "action": "event",
    key: "window.testValue",
    eval_now: true,
    apply: [
      {  
        "key": "window.testSecondValue",
        apply:[metric]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test7');
  expect(evolv.metrics.executed.length).toBe(1)
});

