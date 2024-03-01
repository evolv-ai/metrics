import {convertValue, getValue } from "../src/values";

function getConvertedValue(metric, target){
    let value = getValue(metric, target)
    if (!value) return undefined;
    return convertValue(value, metric.type);
}

//localStorage source
test('localStorage string value', () => {
    window.localStorage.setItem('test', 'ltest');

    let metric = {source: "localStorage", "key": 'test'};
    expect(getConvertedValue(metric)).toBe('ltest');
});

test('localStorage number value', () => {
    window.localStorage.setItem('test', 5);

    let metric = {source: "localStorage", "key": 'test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});

test('localStorage boolean value', () => {
    window.localStorage.setItem('test', true);

    let metric = {source: "localStorage", "key": 'test', type: 'boolean'};
    expect(getConvertedValue(metric)).toBe(true);
});

test('localStorage boolean false value', () => {
    window.localStorage.setItem('test', false);

    let metric = {source: "localStorage", "key": 'test', type: 'boolean'};
    expect(getConvertedValue(metric)).toBe(false);
});

test('localStorage single nested json value', () => {
    window.localStorage.setItem('testNested', '{"value": "nestedValue"}');

    let metric = {source: "localStorage", "key": 'testNested', type: 'string', "extract": {"expression": "value"}};
    expect(getConvertedValue(metric)).toBe('nestedValue');
});

test('localStorage multi nested json value', () => {
    window.localStorage.setItem('testNested', '{"mydata": {"value": "nestedValue"}}');

    let metric = {source: "localStorage", "key": 'testNested', type: 'string', "extract": {"expression": "mydata.value"}};
    expect(getConvertedValue(metric)).toBe('nestedValue');
});

test('localStorage nest json value empty', () => {
    window.localStorage.setItem('testNested', '{"mydata": {"value": "nestedValue"}}');

    let metric = {source: "localStorage", "key": 'testNested', type: 'string', "extract": {"expression": "mydata.value2"}};
    expect(getConvertedValue(metric)).toBe(undefined);
});

//sessionStorage source
test('sessionStorage string value', () => {
    window.sessionStorage.setItem('test', 'stest');

    let metric = {source: "sessionStorage", "key": 'test'};
    expect(getConvertedValue(metric)).toBe('stest');
});

test('sessionStorage number value', () => {
    window.sessionStorage.setItem('test', 5);

    let metric = {source: "sessionStorage", "key": 'test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});


//cookie source
test('cookie string value', () => {
    window.document.cookie = 'test=ctest'

    let metric = {source: "cookie", "key": 'test', type: 'string'};
    expect(getConvertedValue(metric)).toBe('ctest');
});

test('cookie number value', () => {
    window.document.cookie = 'test=5'

    let metric = {source: "cookie", "key": 'test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});

