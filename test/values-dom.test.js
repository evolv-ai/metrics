import {convertValue, getValue } from "../src/values";

function getConvertedValue(metric, target){
    let value = getValue(metric, target)
    if (!value) return undefined;
    return convertValue(value, metric.type);
}

//query source
test('query string value', () => {
    delete window.location;
    window.location = {href: 'http://localhost/?test=qtest#hash'};

    let metric = {source: "query", "key": 'test', type: 'string'};
    expect(getConvertedValue(metric)).toBe('qtest');
});

test('query number value', () => {
    delete window.location;
    window.location = {href: 'http://localhost/?test=5#hash'};
    
    let metric = {source: "query", "key": 'test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});

//dom source
test('dom extract string value', () => {
    window.document.body.innerHTML = `<div class="test">dtest</div>`;
    let target = window.document.querySelector('.test');

    let metric = {source: "dom", "key": '.test', type: 'string', extract: {attribute:"textContent"}};
    expect(getConvertedValue(metric, target)).toBe('dtest');
});

test('dom extract number value', () => {
    window.document.body.innerHTML = `<div class="test">tes5</div>`;
    let target = window.document.querySelector('.test');

    let metric = {source: "dom", "key": '.test', type: 'number', extract: {attribute:"textContent"}};
    expect(getConvertedValue(metric,target)).toBe(5);
});

test('dom extract number value with parse', () => {
    window.document.body.innerHTML = `<div class="test">3test5</div>`;
    let target = window.document.querySelector('.test');

    let metric = {source: "dom", "key": '.test', type: 'number', extract: {attribute:"textContent", parse:'test(.*)'}};
    expect(getConvertedValue(metric,target)).toBe(5);
});

