
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

    let result = parseExpression('window.test:sum.foo.(a.x*b.y)');
    expect(result).toStrictEqual(['window','test', [':sum'], 'foo', [['a', 'x'],'*',['b', 'y']]]);
});