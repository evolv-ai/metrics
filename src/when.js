import { convertValue, getValue } from "./values";

const NumberTypes = ['number', 'int', 'float'];

function checkRichWhen(when, val, type){
    let {operator, value} = when;
    val = convertValue(val, type);

    if (NumberTypes.includes(type)){
        switch (operator) {
            case '<':
                return (val < value);
            case '<=':
                return (val <= value);
            case '>':
                return (val > value);
            case '>=':
                return (val >= value);
            default:
                console.info('evolv metrics: unsupported when operator for number', when)
        }
    } else if (type === 'string'){
        return (new RegExp(value, 'i')).test(val);
    } else {
        console.info('evolv metrics: complex when not operating on numbers', when)
    }
    return false;
}

export function checkWhen(when, context, target){
    if (when == null) return true;

    var val = context.value 
    
    if (val == null) {
       val = getValue(context, target);
    }

    if (typeof when === 'object'){
        return checkRichWhen(when, val, context.type)
    } else if (typeof when === 'string'){
        return (new RegExp(when, 'i')).test(val);
    } else if (typeof when === 'boolean'){
        return when === val
    } else if (typeof when === 'number'){
        return when === val
    } else {
        console.info('evolv metrics: invalid when', when)
        return false
    }
}
