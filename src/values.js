import { adapters } from './adapters.js';
import { resolveValue } from './storage.js';
import { trackWarning } from './track.js';

export function getActiveValue(source, key){
  switch(source){
    case 'expression':     return adapters.getExpressionValue(key);
    case 'on-async':       return adapters.getExpressionValue(key); //delegating to expression
    case 'fetch':          return adapters.getFetchValue(key);
    case 'dom':            return adapters.getDomValue(key);
    case 'jqdom':          return adapters.getJqDomValue(key);
    case 'cookie':         return adapters.getCookieValue(key);
    case 'localStorage':   return adapters.getLocalStorageValue(key);
    case 'sessionStorage': return adapters.getSessionStorageValue(key);
    case 'query':          return adapters.getQueryValue(key);
    case 'extension':      return adapters.getExtensionValue(key);
  }
  return trackWarning({metric: {source,key}, "message": `source "${source}" is invalid`});
}

function extractNumber(val){
  return typeof val === 'string'
       ? val.replace(/[^0-9\.]/g, '')
       : val
}

export function convertValue(val, type){
  switch(type){
    case 'float':   return parseFloat(extractNumber(val));
    case 'int':     return parseInt(extractNumber(val));
    case 'number':  return Number(extractNumber(val));
    case 'boolean': return /^true$/i.test(val);
    case 'array':   return val; //hope the response was in array format - can support tranformations later
    default:        return val.toString();
  }
}


export function applyMap(val, metric){
    let {map, match = 'first'} = metric;

    function getValue(option) {
      return option.default || option.value;
    }
    var fallback;
    if (match === 'first'){
      var results = map.find(function(mapOption){
        if (!mapOption.when) {
          return mapOption.default || mapOption.value;
        }

        var pattern = new RegExp(mapOption.when, 'i');
        return pattern.test(val);
      });
      if (results){
        return getValue(results);
      } else {
        return metric.default;
      }
    } else {
      var results = map.filter(function(mapOption){
          if (!mapOption.when) {
            fallback = mapOption;
            return null;
          }

          var pattern = new RegExp(mapOption.when,'i');
          return pattern.test(val);
      });
      if (results.length === 0 && fallback) return getValue(fallback)
      if (results.length === 1) return getValue(results[0]);
      return null;
    }
}

export function applyCombination(val, baseMetric){
  let { operator, metric } = baseMetric.combination;
  let { source, key, type } = baseMetric;
  let secondaryMetric = {source,key,type, ...metric};
  let secondaryValue = getValue(secondaryMetric);

  if (typeof val != "number" || typeof secondaryValue != "number") {
     trackWarning({
       metric: secondaryMetric,
       "message": `value ${val} or ${secondaryValue} is not a number`
     });
     return;
  }
  switch(operator){
    case 'product':    return val * secondaryValue;
    case 'sum':        return val + secondaryValue;
    case 'min': return Math.min(val, secondaryValue);
    case 'max': return Math.max(val, secondaryValue);
    default:
      trackWarning({
        metric: secondaryMetric,
        "message": `operator ${operator} for combination, is invalid`
      });
      return val;
  }
}

export function getValue(metric, data){
  var val = data || getActiveValue(metric.source, metric.key);
  // var val = data;

  let {extract, value} = metric;
  if (extract){
    if (extract.attribute){
      var extracted = data[extract.attribute];
      val = extract.parse
          ? extracted.match(new RegExp(extract.parse,'i'))[0]
          : extracted;
    } else if (extract.expression){
      if (typeof val !== 'function'){ //otherwise, we leave val alone
        data = data || val;
        data = (typeof data === "string") ? JSON.parse(data) : data;
        val = adapters.getExpressionValue(extract.expression, data);
      }
    } else if (extract.parse && typeof val === 'string'){
      var regex = new RegExp(extract.parse,'i');
      var results = val.match(regex);
      val = results && results[0];
    } else {
      trackWarning({metric, "message": "extract did not include attribute or expression"});
    }
  }

  if (value){
    val = value;
  }

  return metric.storage
       ? resolveValue(val, metric)
       : val;
}
