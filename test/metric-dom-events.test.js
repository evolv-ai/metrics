import { processMetric } from "../src/metric";
import { Mocked, afterTest, beforeTest} from "./utils"

afterEach(afterTest);
beforeEach(beforeTest);

test('dom element detection', () => {
    let metric = {source: "dom", key: ".test", tag: "test1", action: "event"};

    processMetric(metric, {});

    expect(Mocked.collect.calls[0][0]).toBe('.test');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(1);
});


test('dom on event', () => {
    let metric = {source: "dom", key: ".test2", tag: "test2", action: "event", on: "click"};

    processMetric(metric, {});

    expect(Mocked.collect.calls[0][0]).toBe('.test2');
    expect(Mocked.mutateObj.listen.calls[0][0]).toBe('click');
});

test('dom on multiple events', () => {
    let metric = {source: "dom", key: ".test .test2", tag: "test3", action: "event", on: "click mousedown"};

    processMetric(metric, {});

    expect(Mocked.collect.calls[0][0]).toBe('.test .test2');
    expect(Mocked.mutateObj.listen.calls[0][0]).toBe('click mousedown');
});

test('dom on macro event', () => {
    window.addEventListener = jest.fn(x=>x);
    let metric = {source: "dom", key: ".test .test2", tag: "test4", action: "event", on: "scroll:10"};

    processMetric(metric, {});

    //some details here, but just want to make sure it gets delegated properly
    expect(Mocked.collect.calls).toHaveLength(0);
    expect(window.addEventListener.mock.calls[0][0]).toBe('scroll');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(0);
});


test('dom on multiple macro events', () => {
    window.addEventListener = jest.fn(x=>x);
    let metric = {source: "dom", key: ".test .test2", tag: "test5", action: "event", on: "wait:1000 scroll:10"};

    processMetric(metric, {});

    //no normal events
    expect(Mocked.collect.calls).toHaveLength(0);
    expect(Mocked.mutateObj.listen.calls).toHaveLength(0);
    //for macro scroll - wait is a timeout
    expect(window.addEventListener.mock.calls[0][0]).toBe('scroll');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(0);
});

test('dom on both normal and macro event', () => {
    window.addEventListener = jest.fn(x=>x);
    let metric = {source: "dom", key: ".test6", tag: "test6", action: "event", on: "click scroll:10"};

    processMetric(metric, {});

    //for normal
    expect(Mocked.collect.calls[0][0]).toBe('.test6');
    expect(Mocked.mutateObj.listen.calls[0][0]).toBe('click');
    //for macro
    expect(window.addEventListener.mock.calls[0][0]).toBe('scroll');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(0);
});
