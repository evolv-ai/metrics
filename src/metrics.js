
import { prepareConfig } from './config.js';
import { processMetric, clearMetricData } from './metric.js';
import { initializeObservables, resetObservables } from './observables.js';
import { instrumentSpaEvent } from './spa.js';
import { initializeTracking, resetTracking, trackWarning } from './track.js';

const DefaultContext = {"source": "expression", "key": "location.pathname"};
let cachedconfig = {};

export function processConfig(json){
  try{
    initializeObservables()
    initializeTracking();

    if (!json) return trackWarning({json, message:'Evolv Audience warning: Apply list is not array'});

    cachedconfig = prepareConfig(json);
    processMetric(cachedconfig, DefaultContext);
  } catch(e){
    trackWarning({error:e, message:'Evolv Audience error: Unable to process config'});
  }
}

function initSpaListener(){
  function eventHandler(){
    resetObservables();
    resetTracking();
    requestAnimationFrame(()=>{
      clearMetricData(cachedconfig);
      processMetric(cachedconfig, DefaultContext);
    });
  }

  const SpaTag = 'evolv_metrics_spaChange';
  instrumentSpaEvent(SpaTag);
  window.addEventListener(SpaTag, eventHandler);
}

initSpaListener();
