import {convertValue, getValue } from "../src/values";

function getConvertedValue(metric, target){
    let value = getValue(metric, target)
    if (!value) return undefined;
    return convertValue(value, metric.type);
}

test('on async extract string value', () => {
    // window.test = {on: (ev, fnc)=> {
    //     expect(ev).toBe('track');
    //     console.info('tesing the code')
    //     fnc('ontest')
    // }};

    // let metric = {source: "op-async", "key": 'window.test', on: 'track', type: 'string', extract: {expression:"params:at(0)"}};

});

