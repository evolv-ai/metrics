import { processMetric } from "../src/metric";
import { Mocked, afterTest, beforeTest} from "./utils"

afterEach(afterTest);
beforeEach(beforeTest);

test('page on macro event', () => {
    window.addEventListener = jest.fn(x=>x);
    let metric = {source: "extension", key: "page", tag: "test4", action: "event", on: "scroll:10"};

    processMetric(metric, {});

    //some details here, but just want to make sure it gets delegated properly
    expect(Mocked.collect.calls).toHaveLength(0);
    expect(window.addEventListener.mock.calls[0][0]).toBe('scroll');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(0);
});

test('page on macro event with extra params', () => {
    window.addEventListener = jest.fn(x=>x);
    let metric = {source: "extension", key: "page", tag: "test4", action: "event", on: "scroll:speed:-50"};

    processMetric(metric, {});

    //some details here, but just want to make sure it gets delegated properly
    expect(Mocked.collect.calls).toHaveLength(0);
    expect(window.addEventListener.mock.calls[0][0]).toBe('scroll');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(0);
});

test('page on mouseexit macro event with extra params', () => {
    window.addEventListener = jest.fn(x=>x);
    let metric = {source: "extension", key: "page", tag: "test4", action: "event", on: "mouseexit:top:100"};

    processMetric(metric, {});

    //some details here, but just want to make sure it gets delegated properly
    expect(Mocked.collect.calls).toHaveLength(0);
    expect(window.addEventListener.mock.calls[0][0]).toBe('mouseout');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(0);
});

test('page on idle macro with params', () => {
    window.addEventListener = jest.fn(x=>x);
    let metric = {source: "extension", key: "page", tag: "test4", action: "event", on: "idle:100"};

    processMetric(metric, {});

    //some details here, but just want to make sure it gets delegated properly
    expect(Mocked.collect.calls).toHaveLength(0);
    expect(window.addEventListener.mock.calls[0][0]).toBe('mousemove');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(0);
});

test('page on multiple macro events', () => {
    window.addEventListener = jest.fn(x=>x);
    let metric = {source: "extension", key: "page", tag: "test5", action: "event", on: "wait:1000 scroll:10"};

    processMetric(metric, {});

    //no normal events
    expect(Mocked.collect.calls).toHaveLength(0);
    expect(Mocked.mutateObj.listen.calls).toHaveLength(0);
    //for macro scroll - wait is a timeout
    expect(window.addEventListener.mock.calls[0][0]).toBe('scroll');
    expect(Mocked.mutateObj.customMutation.calls).toHaveLength(0);
});

