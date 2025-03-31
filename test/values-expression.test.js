import { convertValue, getValue } from "../src/values";
import { resetTracking } from "../src/track";

function getConvertedValue(metric, target){
    let value = getValue(metric, target)
    if (value === null || value === undefined) return undefined;
    return convertValue(value, metric.type);
}

  beforeEach(() => {
    window.evolv = {metrics:{}}
    resetTracking();
  });


//simple expressions

test('expression string value', () => {
    window.test = 'etest';

    let metric = {source: "expression", "key": 'window.test'};
    expect(getConvertedValue(metric)).toBe('etest');
});

test('expression number value', () => {
    window.test = 5;

    let metric = {source: "expression", key: 'window.test', type: 'number'};
    expect(getConvertedValue(metric)).toBe(5);
});

test('expression with no value', () => {
    window.test = 'test';

    let metric = {source: "expression", key: 'window.nomatch_test'};
    expect(getConvertedValue(metric)).toBe(undefined);
});

//default does not apply at getValue - should we keep this?
// test('expression with default value', () => {
//     window.test = 'test';

//     const metric = {source: "expression", key: 'window.not_test', default: 'dtest'};
//     expect(getConvertedValue(metric)).toBe('dtest');
// });


// complex expressions

test('expression via chained expression', () => {
    window.test = {foo: 'test1'};

    let metric = {source: "expression", key: 'window.test.foo'};
    expect(getConvertedValue(metric)).toBe('test1');
});

test('expression via function call', () => {
    window.test = {foo: ()=>'test2'};

    let metric = {source: "expression", key: 'window.test.foo()'};
    expect(getConvertedValue(metric)).toBe('test2');
});

test('expression via nested function call', () => {
    window.test = ()=> ({foo: 'test3'});

    let metric = {source: "expression", key: 'window.test().foo'};
    expect(getConvertedValue(metric)).toBe('test3');
});

test('expression undefined value', () => {
    window.test = {foo: 'test4'};

    let metric = {source: "expression", key: 'window.test.bar'};
    expect(getConvertedValue(metric)).toBe(undefined);
});


//with macros

test('expression with :at macro', () => {
    window.test = {foo: ['test4','test5']};

    let metric = {source: "expression", key: 'window.test.foo:at(1)'};
    expect(getConvertedValue(metric)).toBe('test5');
});

test('expression with :at macro', () => {
    window.test = {foo: ['test4',{bar: 'test6'}]};

    let metric = {source: "expression", key: 'window.test.foo:at(1).bar'};
    expect(getConvertedValue(metric)).toBe('test6');
});

test('expression with :join macro', () => {
    window.test = {foo: ['test4','test7']};

    let metric = {source: "expression", key: 'window.test.foo:join'};
    expect(getConvertedValue(metric)).toBe('test4|test7');
});

test('expression with :join macro with post attributes', () => {
    window.test = {foo: [{bar:'test4'},{bar:'test8'}]};

    let metric = {source: "expression", key: 'window.test.foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test4|test8');
});

test('expression with :join macro and blanks', () => {
    window.test = {foo: [{bart:'test4'},{bar:'test9'}]};

    let metric = {source: "expression", key: 'window.test.foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test9');
});

test('expression with nested :join macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:'test10'}]},{foo:[{bar:'test11'}]}];

    let metric = {source: "expression", key: 'window.test:join.foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test10|test11');
});

test('expression with :join macro explicit delimeter', () => {
    window.test = [{foo: [{bart:'test4'},{bar:'test12'}]},{foo:[{bar:'test13'}]}];

    let metric = {source: "expression", key: 'window.test:join(,).foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test12,test13');
});

test('expression with :join macro multiple explicit delimeters', () => {
    window.test = [{foo: [{bar:'test4'},{bar:'test12'}]},{foo:[{bar:'test13'}]}];

    let metric = {source: "expression", key: 'window.test:join(,).foo:join(|).bar'};
    expect(getConvertedValue(metric)).toBe('test4|test12,test13');
});


test('expression with :join and :at macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:'test14'}]},{foo:[{bar:'test15'},{bar:'test16'}]}];

    let metric = {source: "expression", key: 'window.test:at(1).foo:join.bar'};
    expect(getConvertedValue(metric)).toBe('test15|test16');
});

test('expression with :sum macro', () => {
    window.test = {foo:[{bar:18}, {bar:19}]};

    let metric = {source: "expression", key: 'window.test.foo:sum.bar', type: 'number'};
    expect(getConvertedValue(metric)).toBe(37);
});

test('expression with :sum & :at macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:17}]},{foo:[{bar:20}, {bar:21}]}];

    let metric = {source: "expression", key: 'window.test:at(1).foo:sum.bar', type: 'number'};
    expect(getConvertedValue(metric)).toBe(41);
});

test('expression with join, :sum macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:17}]},{foo:[{bar:20}, {bar:21}]}];

    let metric = {source: "expression", key: 'window.test:join.foo:sum.bar'};
    expect(getConvertedValue(metric)).toBe('17|41');
});

test('expression with count macro', () => {
    window.test = [{foo: [{bart:'test4'},{bar:17}]},{foo:[{bar:20}, {bar:21}]}];

    let metric = {source: "expression", key: 'window.test:count', type: 'number'};
    expect(getConvertedValue(metric)).toBe(2);
});

test('expression with count macro - filtered', () => {
    window.test = [{foo: [{bart:'test4'},{bar:17}]},{fool:[{bar:20}, {bar:21}]}];

    let metric = {source: "expression", key: 'window.test:count.foo', type: 'number'};
    expect(getConvertedValue(metric)).toBe(1);
});

test('expression with sum and count macro - filtered', () => {
    window.test = [{foo: [{bart:'test4'},{bar:17}]},{foo:[{bar:20}, {bar:21}]}];

    let metric = {source: "expression", key: 'window.test:sum.foo:count.bar', type: 'number'};
    expect(getConvertedValue(metric)).toBe(3);
});


test('expression with join and count macro', () => {
  window.test = {foo: {a:{bar:'test4'},b:{bar:'test8'}, c:{bart:'test'}}};

    // window.test = [{foo: [{bart:'test4'},{bar:17}]},{foo:[{bar:20}, {bar:21}]}];

    let metric = {source: "expression", key: 'window.test.foo:values:count.bar', type: 'number'};
    expect(getConvertedValue(metric)).toBe(2);
});

test('expression with sum and count macro - no filtered', () => {
  window.test = {a: {bart:'test4', bar:7}, b:{bar:2, ban:1}};

    let metric = {source: "expression", key: 'window.test:values:sum.bar', type: 'number'};
    expect(getConvertedValue(metric)).toBe(9);
});

test('expression with filter and count macro - no filtered', () => {
    window.test = [ {bart:'test1', bar:'test2'}, {bar:'test3', ban:'test4'}];
  
      let metric = {source: "expression", key: "window.test:filter(bar,'test'):count", type: 'number'};
      expect(getConvertedValue(metric)).toBe(2);
});

test('expression with filter and count macro - no value', () => {
    window.test = [ {bart:'test1', bar:'test2'}, {bar:'test3', ban:'test4'}];
  
      let metric = {source: "expression", key: "window.test:filter(bar):count", type: 'number'};
      expect(getConvertedValue(metric)).toBe(2);
});

test('expression with filter and count macro - filtered', () => {
    window.test = [ {bart:'test1', bar:'te2'}, {bar:'test3', ban:'test4'}];
  
      let metric = {source: "expression", key: "window.test:filter(bar,'test'):count", type: 'number'};
      expect(getConvertedValue(metric)).toBe(1);
});
test('expression with filter and count macro - all filtered', () => {
    window.test = [ {bart:'test1', bar:'test2'}, {bar:'test3', ban:'test4'}];
  
      let metric = {source: "expression", key: "window.test:filter(bar,'test-not'):count", type: 'number'};
      expect(getConvertedValue(metric)).toBe(0);
});
test('expression with chained filter and count macro - all filtered', () => {
    window.test = [ {bart:'test1', bar:'test2'}, {bar:'test3', ban:'test4'}];
  
      let metric = {source: "expression", key: "window.test:filter(bar,'no match'):count", type: 'number'};
      expect(getConvertedValue(metric)).toBe(0);
});
test('expression with filter and sum macro - filtered', () => {
    window.test = [ {bart:'test1', bar:'test2'}, {bar:'test3', ban:5}];
  
      let metric = {source: "expression", key: "window.test:filter(bar,'test'):sum.ban", type: 'number'};
      expect(getConvertedValue(metric)).toBe(5);
});

test('expression with filter and join macro - filtered', () => {
    window.test = [ {bart:'test1', bar:'test2'}, {bar:'test3', ban:'test10'}];
  
      let metric = {source: "expression", key: "window.test:filter(bar):join(|).ban", type: 'string'};
      expect(getConvertedValue(metric)).toBe('test10');
});

test('expression with filter and at macro - filtered', () => {
    window.test = [ {bart:'test1', bar:'test2'}, {bar:'test3', ban:'test10'},{bar:'test3', ban:'test12'}];
  
      let metric = {source: "expression", key: "window.test:filter(bar,'test3'):at(0).ban", type: 'string'};
      expect(getConvertedValue(metric)).toBe('test10');
});

//with extract

test('expression string value without extract', () => {
    window.test = {foo: '5test|4'};

    let metric = {source: "expression", key: 'window.test.foo'};
    expect(getConvertedValue(metric)).toBe('5test|4');
});

test('expression string value with extract', () => {
    window.test = {foo: '5test,4'};

    let metric = {extract:{parse:",\\d"},source: "expression", key: 'window.test.foo'};
    expect(getConvertedValue(metric)).toBe(',4');
});

test('expression number value with extract', () => {
    window.test = {foo: '5test,4'};

    let metric = {
        type: "number",
        extract:{parse:",\\d"},
        source: "expression",
        key: 'window.test.foo'
    };
    expect(getConvertedValue(metric)).toBe(4);
});

test('expression number value with extract does not impact orginal value', () => {
    window.test = {foo: '5test,4'};

    let metric = {
        type: "number",
        extract:{parse:",\\d"},
        source: "expression",
        key: 'window.test.foo'
    };
    expect(getConvertedValue(metric)).toBe(4);
    expect(window.test.foo).toBe('5test,4');
});



test('expression string value fails with extract', () => {
    window.test = {foo: '5test4'};

    let metric = {extract:{parse:",\\d"},source: "expression", key: 'window.test.foo'};
    expect(getConvertedValue(metric)).toBe(undefined);
});
