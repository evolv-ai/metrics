
//example:
// "storage": {
//     "type": "(session|local)", 
//     "key": "my-key",
//     "resolveWith": "(new|cached|union)"
// },

import { convertValue } from "./convert";
import { cookieStore } from "./cookieStore";
import { trackWarning } from "./track";

const storePrefix = 'evolv:';

const Storage = {
    'session': window.sessionStorage,
    'local': window.localStorage,
    'cookie': cookieStore(),
    'default': window.sessionStorage
};


function marshalValue(valueType, value){
    switch(valueType){
        case 'float': return value;
        case 'int': return value;
        case 'number': return value;
        case 'boolean': return value;
        case 'array': return JSON.stringify(value); 
        default: return value.toString();
    }
}

function unmarshalValue(valueType, value){
    if (value === null) return null;

    switch(valueType){
        case 'float': return parseFloat(value);
        case 'int': return parseInt(value);
        case 'number': return Number(value);
        case 'boolean': return /^true$/i.test(value);
        case 'array': return JSON.parse(value);
        default: return value.toString();
    }   
}

function getKey(storage){
    return `${storePrefix}${storage.key}`;
}

function getStore(storage){
    return Storage[storage.type || 'default'];
}

function setStoreValue(storage, valueType, value){
    getStore(storage).setItem(getKey(storage), marshalValue(valueType, value));
}

function getStoreValue(storage, valueType){
    return unmarshalValue(valueType, getStore(storage).getItem(getKey(storage)));
}

function resolveStoreValue(storage, valueType, value, storeValue){
    if (storeValue === null) return value;

    let resolveWith = storage.resolveWith;

    if (valueType === 'array'){
        if (typeof storeValue === 'string'){
            storeValue = JSON.parse(storeValue);
        }
        switch(resolveWith) {
            case 'cached': return storeValue;
            case 'new': return value;
            case 'union': return [...(new Set([...storeValue, ...(Array.isArray(value) ? value : [value])]))];
            case 'concat': return [...storeValue, ...(Array.isArray(value) ? value : [value])];
            default:  return  [...(new Set([...storeValue, ...(Array.isArray(value) ? value : [value])]))];
        }
    } else if (valueType === 'number') {
        switch(resolveWith) {
            case 'max': return Math.max(storeValue, value);
            case 'min': return Math.min(storeValue, value);
            case 'sum': return storeValue + value;
            case 'cached': return storeValue;
            case 'new': return value;
            default: return value;
        }
    } else if (valueType === 'boolean') {
        switch(resolveWith) {
            case 'or': return storeValue || value;
            case 'and': return storeValue && value;
            case 'cached': return storeValue;
            case 'new': return value;
            default: return value;
        }
    } else {
        switch(resolveWith) {
            case 'cached': return storeValue;
            default: return value;
        }
    }
}

function validateStorage(storage){
    if (!storage.key){
        trackWarning({storage, message: 'No key for storage'});
        return false;
    }
    return true;
}

export function resolveValue(val, metric){
    const storage = metric.storage;
    const valueType = metric.type || 'string';
    const value = (val !== undefined && val !== null)
                ? convertValue(val, valueType)
                : val

    if (!validateStorage(storage)){
        return value;
    }

    let storeValue = getStoreValue(storage, valueType);
    let result = resolveStoreValue(storage, valueType, value, storeValue);

    if (storeValue !== result) {
        setStoreValue(storage, valueType, result);
    }

    return result;
}