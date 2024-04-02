import { emitEvent } from './event.js';
import { mergeMetric } from './inheritance.js';
import { observeSource } from './observables.js';
import { trackEvaluating, trackExecuted, trackWarning } from './track.js';
import { applyCombination, applyMap, convertValue, getValue } from './values.js';
import { checkWhen } from './when.js';

let processedMetrics = [];
export function processMetric(metric, context){
  if (!checkWhen(metric.when, context)) return;
  if (processedMetrics.includes(metric)) return;
  processedMetrics.push(metric);

  let mergedMetric = mergeMetric(context, metric);
  trackEvaluating(mergedMetric);

  if (metric.apply){
    if (hasKeysChanged(mergedMetric, context)){
      connectAbstractMetric(metric, mergedMetric, context);
    } else {
      metric.data = context.data;
      processApplyList(metric.apply, mergedMetric);
    }
  } else if (isComplete(mergedMetric))  {
    applyConcreteMetric(mergedMetric, context);
  } else if (!metric.comment){
    trackWarning({metric:mergedMetric, message:'Evolv Audience - Metric was incomplete: '});
  }
}

function hasKeysChanged(metric, context){
  return metric.key &&  (metric.key !== context.key);
}

function processApplyList(applyList, context){
    if (!Array.isArray(applyList)) return trackWarning({applyList, context, message:'Evolv Audience warning: Apply list is not array'});

    applyList.forEach(metric => processMetric(metric, context));
}

function applyConcreteMetric(metric, context){
  if (metric.action === "event"){
    connectEvent(metric.tag, metric, context);
  } else{
    addAudience(metric.tag, metric, context);
  }
}

function connectAbstractMetric(bm, metric, context){
  let observer = observeSource(metric, context);

  observer.subscribe((val,data) => {
    metric.data = bm.data = data;
    let {on, when, ...cleanedMetric} = metric;
    if (!bm.key) metric.key = bm.key;

    processApplyList(bm.apply, cleanedMetric);
  });
}

function connectEvent(tag, metric, context){
  var fired = false;
  observeSource(metric, context)
    .subscribe((val,data) => {
      if (fired) return;

      if (context.extract && metric.when){
          context.value = undefined;
          context.value = convertValue(getValue(context,data), context.type);
      }
      if (checkWhen(metric.when, context, data)){
        fired = true;
        setTimeout(()=> emitEvent(tag, metric, data, context), 0);
      }
    });
}

function addAudience(tag, metric, context){
  try {
    observeSource(metric, context)
      .subscribe((value, data) =>{
        if (value === null || value === undefined){
          value = getValue(metric, data);
        }
        if (value !== null && value !== undefined){
          bindAudienceValue(tag, value, metric);
        }
      });
  } catch(e){
    trackWarning({metric, tag, message: `Unable to add audience for: ${e}`});
  }
}

function bindAudienceValue(tag, val, metric){
    const audienceContext = window.evolv.context;
    let newVal;
    if (metric.default === val){
        newVal = val;
    } else if (metric.map){
        newVal = applyMap(val, metric);
        if (!newVal && (!metric.type || metric.type === 'string')) return;
    } else if (metric.combination){
        newVal = applyCombination(val, metric);
    } else{
        newVal = convertValue(val, metric.type);
    }

    if (audienceContext.get(tag) ===  newVal) return false;

    audienceContext.set(tag, newVal);
    trackExecuted({tag, bind: metric, value: newVal});
    return true;
}

function isComplete(metric){
  return !!metric.source && typeof metric.source === 'string'
      // && !!metric.key && typeof metric.key === 'string'
      && !!metric.tag && typeof metric.tag === 'string';
}

export function clearMetricData(baseMetric){
  function clearData(metric){
    metric.data = undefined;
    (metric.apply || []).forEach(clearData)
  }

  processedMetrics = [];
  clearData(baseMetric);
}
