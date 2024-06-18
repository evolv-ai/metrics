







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

test('test bind with poll failing with default', () => {
  window.testValue = undefined;

  let context = {
  };

  let metric = {
    source: "expression",
    key: "window.testValue",
    tag: "test",
    action: "bind",
    default: "none",
    poll: {interval: 25, duration: 500}
  };

  processMetric(metric, context);

  expect(bind.mock.lastCall).toBe(undefined);

  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('none');
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test bind before poll  with defaul', () => {
  window.testValue = undefined;

  let context = {
  };

  let metric = {
    source: "expression",
    key: "window.testValue",
    tag: "test",
    action: "bind",
    default: "none",
    poll: {interval: 25, duration: 500}
  };

  processMetric(metric, context);

  expect(bind.mock.lastCall).toBe(undefined);

  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test');
  expect(bind.mock.lastCall[1]).toBe('none');
  expect(evolv.metrics.executed.length).toBe(1)
});


test('test bind with poll failing and no default', () => {
  window.testValue = undefined;

  let context = {
  };

  let metric = {
    source: "expression",
    key: "window.testValue",
    tag: "test",
    action: "bind",
    poll: {interval: 25, duration: 500}
  };

  processMetric(metric, context);

  expect(bind.mock.lastCall).toBe(undefined);

  jest.runAllTimers();

  expect(bind.mock.lastCall).toBe(undefined);
  expect(evolv.metrics.executed.length).toBe(0)
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

  let context = {
    source: "expression",
    action: "event",
    key: "window.testValue",
    apply: [
      {
        key: "window.testSecondValue",
        apply:[{
          when: "test",
          tag: "test6",
        }]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  jest.runAllTimers();

  expect(event.mock.lastCall).toBe(undefined);
  // expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)
});

test('test polling context with extra layer for conditions', () => {
  window.testValue = undefined;
  window.testSecondValue = "test";

  let context = {
    source: "expression",
    action: "event",
    key: "window.testValue",
    apply: [
      {
        key: "window.testSecondValue",
        apply:[{
          when: "test",
          tag: "test7",
        }]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  // expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test7');
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test polling context with extra layer for conditions', () => {
  window.testValue = undefined;
  window.testSecondValue = "test";

  let context = {
    source: "expression",
    action: "event",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        key: "window.testSecondValue",
        apply:[{
          when: "test",
          tag: "test8",
        }]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  // expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test8');
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test polling context with 2 extra layers for conditions', () => {
  window.testValue = undefined;
  window.testSecondValue = "test";

  let context = {
    source: "expression",
    action: "event",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        key: "window.testSecondValue",
        apply:[{
          when: "test",
          apply:[
            {
              tag: "test9"
            }
          ]
        }]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  // expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test9');
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test polling context with optional 2 extra layers for conditions', () => {
  window.testValue = undefined;
  window.testSecondValue = "test";

  let context = {
    source: "expression",
    action: "event",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        apply: [
          {
            key: "window.testSecondValue",
            apply:[{
              when: "test",
              apply:[
                {
                  tag: "test10"
                }
              ]
            }]
          }
        ]
      }
    ],
    poll: {duration: 100}
  };

  processMetric(context, {});

  // expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';

  jest.runAllTimers();

  expect(event.mock.lastCall[0]).toBe('test10');
  expect(evolv.metrics.executed.length).toBe(1)
});



// poll vs subscribe

test('test polling context with 2nd change', () => {
  window.testValue = undefined;

  let context = {
    source: "expression",
    action: "bind",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        tag: "test11",
      }
    ],
    poll: {duration: 200}
  };

  processMetric(context, {});

  // expect(evolv.metrics.evaluating.length).toBe(2)
  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';
  jest.runOnlyPendingTimers()

  expect(bind.mock.lastCall[0]).toBe('test11');
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test polling context with 2nd change, but first change fails', () => {
  window.testValue = undefined;

  let context = {
    source: "expression",
    action: "bind",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        tag: "test12",
      }
    ],
    poll: {duration: 200, interval: 10}
  };

  processMetric(context, {});
  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'notAvail';
  jest.runAllTimers();

  expect(bind.mock.lastCall).toBe(undefined);
});

test('test polling context with 2nd change, but first change fails', () => {
  window.testValue = undefined;

  let context = {
    source: "expression",
    action: "bind",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        tag: "test13",
      }
    ],
    poll: {duration: 200, interval: 10}
  };

  processMetric(context, {});

  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'notAvail';
  jest.advanceTimersByTime(50);

  window.testValue = 'ready';
  jest.runAllTimers();

  expect(bind.mock.lastCall).toBe(undefined);
});

test('test subscribe context with 2nd change, but first change fails', () => {
  window.testValue = undefined;

  let context = {
    source: "expression",
    action: "bind",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        tag: "test13",
      }
    ],
    sybscribe: {duration: 200, interval: 10}
  };

  processMetric(context, {});

  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'notAvail';
  jest.runAllTimers();

  expect(bind.mock.lastCall).toBe(undefined);
});

test('test subscribe context with 2nd change, but first change fails', () => {
  window.testValue = undefined;

  let context = {
    source: "expression",
    action: "bind",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        tag: "test15",
      }
    ],
    subscribe: {duration: 200, interval:10}
  };

  processMetric(context, {});

  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test15');
  expect(bind.mock.calls.length).toBe(1);
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test subscribe context with 2nd change, but first change fails', () => {
  window.testValue = undefined;

  let context = {
    source: "expression",
    action: "bind",
    key: "window.testValue",
    apply: [
      {
        when: "ready",
        tag: "test16",
      }
    ],
    subscribe: {duration: 200, interval:40}
  };

  processMetric(context, {});

  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'notAvail';
  jest.advanceTimersByTime(50);

  window.testValue = 'ready';
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test16');
  expect(bind.mock.calls.length).toBe(1);
  expect(evolv.metrics.executed.length).toBe(1)
});

test('test subscribe context with 2 changes and bind processes both', () => {
  window.testValue = undefined;

  let context = {
    source: "expression",
    action: "bind",
    key: "window.testValue",
    apply: [
      {
        tag: "test17",
      }
    ],
    subscribe: {duration: 200, interval:10}
  };

  processMetric(context, {});

  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready1';
  jest.advanceTimersByTime(50);

  expect(bind.mock.lastCall[0]).toBe('test17');
  expect(bind.mock.lastCall[1]).toBe('ready1');

  window.testValue = 'ready2';
  jest.runAllTimers();

  expect(bind.mock.lastCall[0]).toBe('test17');
  expect(bind.mock.lastCall[1]).toBe('ready2');
});

test('test subscribe context with 2nd change, but values dont change', () => {
  window.testValue = undefined;

  let context = {
    source: "expression",
    action: "bind",
    key: "window.testValue",
    apply: [
      {
        tag: "test18",
      }
    ],
    subscribe: {duration: 200, interval:10}
  };

  processMetric(context, {});

  expect(evolv.metrics.executed.length).toBe(0)

  window.testValue = 'ready';
  jest.advanceTimersByTime(50);

  window.testValue = 'ready';
  jest.runAllTimers();


  expect(bind.mock.lastCall[0]).toBe('test18');
  expect(bind.mock.calls.length).toBe(1);
  expect(evolv.metrics.executed.length).toBe(1)
});
