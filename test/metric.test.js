
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

test('test bind before polling with default not appying', () => {
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
  expect(evolv.metrics.executed.length).toBe(0)
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
