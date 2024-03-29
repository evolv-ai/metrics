import { applyMap} from "../src/values";

test('map first', () => {
    let metric = {source: 'expression', "key": "test", map:[
        {when: "test", value: "first"}
    ]};
    expect(applyMap('test',metric)).toBe('first');
});

test('map second', () => {
    let metric = {value: 'test', map:[
        {when: "testmore", value: "first"},
        {when: "test", value: "second"}
    ]};
    expect(applyMap('test', metric)).toBe('second');
});

test('map no match', () => {
    let metric = {value: 'test', map:[
        {when: "testnot", value: "first"}
    ]};
    expect(applyMap('test', metric)).toBe(undefined);
});

test('map no match, but with default', () => {
    let metric = {default: 'dtest', map:[
        {when: "testnot", value: "first"}
    ]};
    expect(applyMap('test', metric)).toBe('dtest');
});

test('map all', () => {
  let metric = {value: 'test',  match: 'all',
    map:[
        {when: "testnot", value: 5},
        {value: 3}
    ]};
    expect(applyMap('test', metric)).toBe(3);
});



test('map to number', () => {
    let metric = {value: 'test',  map:[
        {when: "test", value: 5}
    ]};
    expect(applyMap('test', metric)).toBe(5);
});

// not supported yet
// test('map from number', () => {
//     let metric = {type: 'number', map:[
//         {when: {operator: '>=', value: 5}, value: "first"}
//     ]};
//     expect(applyMap(5, metric)).toBe('first');
// });
