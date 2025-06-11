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


test('combination for product with numbers', () => {
  window.val1 = 2;
  window.val2 = 7;

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "number",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "product",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    //reqired because we have to delay due to our default GA integration
    jest.runAllTimers();

    //adding the intent her, but implementing this on later version
    expect(bind.mock.lastCall[1]).toBe(14);
    expect(evolv.metrics.executed.length).toBe(1)
});

test('combination for sum with numbers', () => {
  window.val1 = 2;
  window.val2 = 7;

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "number",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "sum",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    //reqired because we have to delay due to our default GA integration
    jest.runAllTimers();

    //adding the intent her, but implementing this on later version
    expect(bind.mock.lastCall[1]).toBe(9);
    expect(evolv.metrics.executed.length).toBe(1)
});

test('combination for min with numbers', () => {
  window.val1 = 2;
  window.val2 = 7;

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "number",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "min",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    //reqired because we have to delay due to our default GA integration
    jest.runAllTimers();

    //adding the intent her, but implementing this on later version
    expect(bind.mock.lastCall[1]).toBe(2);
    expect(evolv.metrics.executed.length).toBe(1)
});

test('combination for max with numbers', () => {
  window.val1 = 2;
  window.val2 = 7;

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "number",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "max",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    //reqired because we have to delay due to our default GA integration
    jest.runAllTimers();

    //adding the intent her, but implementing this on later version
    expect(bind.mock.lastCall[1]).toBe(7);
    expect(evolv.metrics.executed.length).toBe(1)
});


test('combination for invalid operator', () => {
  window.val1 = 2;
  window.val2 = 7;

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "string",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "mean",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    //reqired because we have to delay due to our default GA integration
    jest.runAllTimers();

    //adding the intent her, but implementing this on later version
    // expect(bind.mock.lastCall[1]).toBe(14);

    expect(evolv.metrics.warnings.length).toBe(1)
});


test('combination for product with wrong types', () => {
  window.val1 = 'test';
  window.val2 = 7;

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "string",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "product",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    //reqired because we have to delay due to our default GA integration
    jest.runAllTimers();

    //adding the intent her, but implementing this on later version
    // expect(bind.mock.lastCall[1]).toBe(14);

    expect(evolv.metrics.warnings.length).toBe(1)
});


test('combination for product with extract', () => {
  window.val1 = { val: 5};
  window.val2 = 7;

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "string",
      tag: "test1",
      action: "bind",
      extract: {
        expression: 'val'
      },
      combination: {
        operator: "product",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(35);

    expect(evolv.metrics.executed.length).toBe(1)
});


test('combination for vector subset', () => {
  window.val1 = [2,3,4];
  window.val2 = [2,3];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "subset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(true);

    expect(evolv.metrics.executed.length).toBe(1)
});


test('combination for vector subset', () => {
  window.val1 = [2,3,4];
  window.val2 = [2,3,5];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "subset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(false);

    expect(evolv.metrics.executed.length).toBe(1)
});


test('combination for vector subset', () => {
  window.val1 = [2,3];
  window.val2 = [2,3];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "subset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(true);

    expect(evolv.metrics.executed.length).toBe(1)
});


test('combination for vector proper-subset', () => {
  window.val1 = [2,3,4];
  window.val2 = [2,3];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "proper-subset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(true);

    expect(evolv.metrics.executed.length).toBe(1)
});


test('combination for vector proper-subset', () => {
  window.val1 = [2,3];
  window.val2 = [2,3];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "proper-subset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(false);

    expect(evolv.metrics.executed.length).toBe(1)
});

test('combination for vector superset', () => {
  window.val1 = [2,3,4];
  window.val2 = [2,3,5];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "superset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(false);

    expect(evolv.metrics.executed.length).toBe(1)
});

test('combination for vector superset', () => {
  window.val1 = [2,3];
  window.val2 = [2,3];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "superset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(true);

    expect(evolv.metrics.executed.length).toBe(1)
});

test('combination for vector superset', () => {
  window.val1 = [2,3];
  window.val2 = [2,3,5];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "superset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(true);

    expect(evolv.metrics.executed.length).toBe(1)
});

test('combination for vector proper-superset', () => {
  window.val1 = [2,3];
  window.val2 = [2,3,5];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "proper-superset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(true);

    expect(evolv.metrics.executed.length).toBe(1)
});

test('combination for vector proper-superset', () => {
  window.val1 = [2,3];
  window.val2 = [2,3];

    let metric = {
      source: "expression",
      key: "window.val1",
      type: "boolean",
      tag: "test1",
      action: "bind",
      combination: {
        operator: "proper-superset",
        metric: {
          key: "window.val2"
        }
      }
    };

    processMetric(metric, {});

    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(false);

    expect(evolv.metrics.executed.length).toBe(1)
});




test('combination for robust proper-subset (vcg)', () => {
  window.current = [{category: 'BYOPERK', id: "32"}, {category: 'BYOPERK', id: "48"}];
  window.owns = [{category: 'nonmatching', id: "56"}];
  window.pathname = "/checkout";

  let metric = {
            "source": "expression",
            "key": "window.current:filter(category, 'BYOPERK').id",
            "type": "boolean",
            "combination": {
                "operator": "proper-subset",
                "metric": {
                    "key": "window.owns:filter(category, 'BYOPERK').id"
                }
            },
            "apply": [
                {
                    "when": true,
                    "action": "bind",
                    "type": "number",
                    "tag": "newTest",
                    "key": "window.pathname",
                    "default": 0,
                    "map": [
                        {
                            "when": "summary",
                            "value": 1
                        },
                        {
                            "when": "checkout",
                            "value": 0.3
                        }
                    ]
                }
            ]
        };

    processMetric(metric, {});
    jest.runAllTimers();

    expect(bind.mock.lastCall[1]).toBe(0.3);
    expect(evolv.metrics.executed.length).toBe(1)
});
