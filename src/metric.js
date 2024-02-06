import { emitEvent } from './event.js';
import { mergeMetric } from './inheritance.js';
import { observeSource } from './observables.js';
import { trackEvaluating, trackExecuted, trackWarning } from './track.js';
import { applyMap, convertValue, getValue } from './values.js';
import { checkWhen } from './when.js';

export function processMetric(metric, context){
  // console.info('processMetric', metric, context)
  if (notApplicabile(metric, context)) return;
  let mergedMetric = mergeMetric(context, metric);
  trackEvaluating({...mergedMetric, apply: metric.apply});
  mergedMetric.when = metric.when;// || context.when;

  if (metric.apply){
    //remove eval_now on next release
    if (metric.when || hasKeysChanged(mergedMetric, context)){
      // if (!metric.key) mergedMetric.key = metric.key;
      connectAbstractMetric(metric, mergedMetric, context);
    } else {
      processApplyList(metric.apply, mergedMetric)//handle map conditions
    }
  } else if (!isComplete(mergedMetric))  {
    if (!metric.comment) trackWarning({metric:mergedMetric, message:'Evolv Audience - Metric was incomplete: '});
  } else {
    applyConcreteMetric(mergedMetric, context);
  }
}

function hasKeysChanged(metric, context){
  return metric.key && context.key && (metric.key !== context.key);
}

function processApplyList(applyList, context){
    // console.info('processApplyList', applyList, context)
    if (!Array.isArray(applyList)) return trackWarning({applyList, context, message:'Evolv Audience warning: Apply list is not array'});
    applyList.forEach(metric => processMetric(metric, context));
}

function supportsAsync(context){
  // return (context.source === 'dom') || (context.source === 'on-async');
  return (context.source === 'dom') || (context.source === 'on-async') || context.poll;
}

function notApplicabile(metric, context){
   return !supportsAsync(context) && !checkWhen(metric.when, context);
}

function applyConcreteMetric(metric, context){
  if (metric.action === "event"){
    connectEvent(metric.tag, metric, context);
  } else{    
    addAudience(metric.tag, metric, context);
  }
}

function connectAbstractMetric(bm, metric, context){
  // console.info('connectAbstractMetric', bm, metric, context)
  let observer = hasKeysChanged(metric, context) || metric.when
               ? observeSource(context) 
               : observeSource(metric, context);
  observer.subscribe((val,data) => {    
      let value = val || getValue(context, data);
      // console.info('connect abstract activated', metric, context, value, hasKeysChanged(metric, context))
      if (checkWhen(metric.when, {...metric, value}, data)){
          // console.info('when clause satisfied', context, value)
          let {on, when, ...cleanedMetric} = metric;
          if (!bm.key) metric.key = bm.key;
          if (data){
            processApplyList(bm.apply, {...cleanedMetric, data});
          } else {
            processApplyList(bm.apply, {...cleanedMetric, on});
          }
      }
  });
}

function connectEvent(tag, metric, context){
  var fired = false;
  // console.info('in connect Event', metric, context)
  observeSource(metric, context)
    .subscribe(((val,data) => {
      if (fired) return;

      if (context.extract && metric.when){
          context.value = undefined;
          context.value = convertValue(getValue(context,data), context.type);
      }
      // console.info('we fired the connectEvent', val, data, checkWhen(metric.when, context, data))
      if (checkWhen(metric.when, context, data)){
        fired = true;
        // console.info('firing event', tag, metric, data, context)
        setTimeout(()=> emitEvent(tag, metric, data, context), 0);
      }
    }));
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

function once(fnc){
  let called = false;
  return function(...args){
    if (called) return;
    called = true;
    fnc.apply(this,args);
  }
}

//audience bind
function bindAudienceValue(tag, val, metric){
    const audienceContext = window.evolv.context;
    let newVal;
    if (metric.default === val){
        newVal = val;
    } else if (metric.map){
        newVal = applyMap(val, metric);
        if (!newVal && (!metric.type || metric.type === 'string')) return;
    } else {
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
