import { prepareConfig } from "../src/config";
import { } from "../src/values";


test('simple nomerge', () => {
    let config = {
        source: 'expression',
        key: "test",
        apply:[ {when: "test", tag: "test", value: "first"}]
    };
    let results = prepareConfig(config);

    expect(results.apply.length).toBe(1);
    expect(results.key).toBe('test');
});

test('simple merge', () => {
    let config = {
        source: 'expression',
        key: "test",
        apply:[ {when: "test", tag: "test", value: "first"}],
        _base: {
            key: "test2",
            apply:[{when: "test2", tag: "test", value: "second"}]
        }
    };
    let results = prepareConfig(config);

    expect(results.key).toBe(undefined);
    expect(results.apply.length).toBe(2);
    expect(results.apply[1].key).toBe('test2');
});

test('simple macro standalone', () => {
    let config = {
        source: 'expression',
        key: "test",
        macro: 'testmacro',
        apply:[ {when: "test", macro: "testmacro", value: "first"}],
        _base: {
            defmacros: {
                testmacro: {"tag": "macrotag"}
            },
        }
    };
    let results = prepareConfig(config);

    expect(results.key).toBe(undefined);
    expect(results.apply[0].tag).toBe("macrotag");
    expect(results.apply[0].macro).toBe(undefined);
    expect(results.apply[0].apply[0].tag).toBe("macrotag");
});

test('simple macro with metrics', () => {
    let config = {
        source: 'expression',
        key: "test",
        macro: 'testmacro',
        apply:[ {when: "test", macro: "testmacro", value: "first"}],
        _base: {
            key: "test2",
            defmacros: {
                testmacro: {"tag": "macrotag"}
            },
            apply:[{when: "test2", tag: "test", value: "second"}]
        }
    };
    let results = prepareConfig(config);

    expect(results.key).toBe(undefined);
    expect(results.apply[0].tag).toBe("macrotag");
    expect(results.apply[0].macro).toBe(undefined);
    expect(results.apply[0].apply[0].tag).toBe("macrotag");
    expect(results.apply[1].key).toBe('test2');
});

test('macro with multiple attributes', () => {
    let config = {
        source: 'expression',
        key: "test",
        macro: 'testmacro',
        apply:[ {when: "test", macro: "testmacro", value: "first"}],
        _base: {
            key: "test2",
            defmacros: {
                testmacro: {"tag": "macrotag", "value": "macrovalue"},
            },
            apply:[{when: "test2", tag: "test", value: "second"}]
        }
    };
    let results = prepareConfig(config);

    expect(results.key).toBe(undefined);
    expect(results.apply[0].tag).toBe("macrotag");
    expect(results.apply[0].value).toBe("macrovalue");
    expect(results.apply[0].apply[0].tag).toBe("macrotag");
    expect(results.apply[1].key).toBe('test2');
});

test('macro with multiple attributes and override', () => {
    let config = {
        source: 'expression',
        key: "test",
        macro: 'testmacro',
        apply:[ {when: "test", macro: "testmacro", value: "first"}],
        _base: {
            key: "test2",
            defmacros: {
                testmacro: {"tag": "macrotag", "value": "macrovalue"},
            },
            apply:[{when: "test2", tag: "test", value: "second"}]
        }
    };
    let results = prepareConfig(config);

    expect(results.key).toBe(undefined);
    expect(results.apply[0].tag).toBe("macrotag");
    expect(results.apply[0].apply[0].tag).toBe("macrotag");
    expect(results.apply[0].apply[0].value).toBe("first");
    expect(results.apply[1].key).toBe('test2');
});

test('multiple macros', () => {
    let config = {
        source: 'expression',
        key: "test",
        macro: 'testmacro',
        apply:[ {when: "test", macro: "testmacro2", value: "first"}],
        _base: {
            key: "test2",
            defmacros: {
                testmacro: {"tag": "macrotag"},
                testmacro2: {"tag": "macrotag2"},
            },
            apply:[{when: "test2", tag: "test", value: "second"}]
        }
    };
    let results = prepareConfig(config);

    expect(results.key).toBe(undefined);
    expect(results.apply[0].tag).toBe("macrotag");
    expect(results.apply[0].apply[0].tag).toBe("macrotag2");
    expect(results.apply[0].apply[0].value).toBe("first");
    expect(results.apply[1].key).toBe('test2');
});
