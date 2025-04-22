
import { parseExpression } from "../src/expressionParser";


test('expression with macros', () => {

    let result = parseExpression('window.test:sum.foo:count.bar');
    expect(result).toStrictEqual(['window','test', [':sum'], 'foo', [":count"], 'bar']);
});

test('expression with macros with params', () => {

    let result = parseExpression('window.test:sum.foo:at(0).bar');
    expect(result).toStrictEqual(['window','test', [':sum'], 'foo', [":at", '0'], 'bar']);
});

test('expression with expression', () => {

    let result = parseExpression('window.test:sum.foo.(a*b)');
    expect(result).toStrictEqual(['window','test', [':sum'], 'foo', [['a'],'*',['b']]]);
});

test('expression with expression chaining', () => {

    let result = parseExpression('test:sum.foo.(a.x*b.y)');
    expect(result).toStrictEqual(['test', [':sum'], 'foo', [['a', 'x'],'*',['b', 'y']]]);
});

//todo: add support for expression with embedded macro
// test('expression with expression and macros', () => {

//     let result = parseExpression('test:sum.(a.bar*ban:count)');
//     expect(result).toStrictEqual(['test', [':sum'], [['a', 'bar'],'*',['ban', [':count']]]]);
// });
