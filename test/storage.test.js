
import { resolveValue } from "../src/storage";


test('resolve value from session', () => {

    const metric = {storage:{key:'test', type: 'session'}};
    expect(resolveValue('test', metric)).toBe('test');
    expect(window.sessionStorage.getItem('evolv:test')).toBe('test');  
});

test('resolve string with default from session', () => {
    window.sessionStorage.setItem('evolv:test', 'ctest');

    const metric = {storage:{key:'test', type:'session'}};
    expect(resolveValue('test', metric)).toBe('test');  
    expect(window.sessionStorage.getItem('evolv:test')).toBe('test');  
});
  
test('resolve value from local', () => {

    const metric = {storage:{key:'test', type: 'local'}};
    expect(resolveValue('test', metric)).toBe('test');
    expect(window.localStorage.getItem('evolv:test')).toBe('test');  
});

test('resolve string with default from local', () => {
    window.localStorage.setItem('evolv:test', 'ctest');

    const metric = {storage:{key:'test', type:'local'}};
    expect(resolveValue('test', metric)).toBe('test');  
    expect(window.localStorage.getItem('evolv:test')).toBe('test');  
});

test('resolve string with cached', () => {
    window.localStorage.setItem('evolv:test', 'ctest');

    const metric = {storage:{key:'test', type:'local', 'resolveWith':'cached'}};
    expect(resolveValue('test', metric)).toBe('ctest');  
    expect(window.localStorage.getItem('evolv:test')).toBe('ctest');  
});


// resolve numbers

test('resolve number with sum', () => {
    window.localStorage.setItem('evolv:test', 2);

    const metric = {type: 'number', storage:{key:'test', type:'local', 'resolveWith':'sum'}};
    expect(resolveValue(3, metric)).toBe(5);  
    expect(window.localStorage.getItem('evolv:test')).toBe('5');  
});

test('resolve number with min', () => {
    window.localStorage.setItem('evolv:test', 2);

    const metric = {type: 'number', storage:{key:'test', type:'local', 'resolveWith':'min'}};
    expect(resolveValue(3, metric)).toBe(2); 
    expect(window.localStorage.getItem('evolv:test')).toBe('2');  
});

test('resolve number with max', () => {
    window.localStorage.setItem('evolv:test', 2);

    const metric = {type: 'number', storage:{key:'test', type:'local', 'resolveWith':'max'}};
    expect(resolveValue(3, metric)).toBe(3);  
    expect(window.localStorage.getItem('evolv:test')).toBe('3');  
});

test('resolve number with sum from blank', () => {
    window.localStorage.removeItem('evolv:test');

    const metric = {type: 'number', storage:{key:'test', type:'local', 'resolveWith':'sum'}};
    expect(resolveValue(1, metric)).toBe(1);  
    expect(window.localStorage.getItem('evolv:test')).toBe('1');  
});

test('resolve number with cached', () => {
    window.localStorage.setItem('evolv:test', 2);

    const metric = {type: 'number', storage:{key:'test', type:'local', 'resolveWith':'cached'}};
    expect(resolveValue(1, metric)).toBe(2);  
    expect(window.localStorage.getItem('evolv:test')).toBe('2');  
});
