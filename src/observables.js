'use strict';

import { adapters } from './adapters.js';
import { trackWarning } from './track.js';
import { getValue } from './values.js';
import { checkWhen } from './when.js';

function genName(){
  return `metrics-${new Date().getTime()}`;
}

let collect = null;
let mutate = null;

function isValidValue(val){
  return (val !== undefined && val !== null);
}

export function initializeObservables(){
  var scope = window.evolv.collect.scope(genName());
  collect = scope.collect;
  mutate = scope.mutate;
}

export function resetObservables(){
  clearPoll();
  mutateQueue.forEach(m=>m.revert())
  mutateQueue = [];
}

function supportPolling(metric){
  return (metric.poll || metric.subscribe)
      && metric.source !== 'dom'
      && metric.source !== 'query';
}

let pollingQueue = [];

function removePoll(poll){
  clearInterval(poll);
  pollingQueue = pollingQueue.filter(p=> p!==poll);
}
function clearPoll(){
  pollingQueue.forEach(p=>clearInterval(p));
  pollingQueue = [];
}
function addPoll(poll){
  pollingQueue.push(poll);
}

let mutateQueue = [];
let collectCache = {};

function getMutate(metric){
  let collectName = collectCache[metric.key];

  if (!collectName){
    collectName = genUniqueName(metric.tag);
    collectCache[metric.key] = collectName;
    collect(metric.key, collectName);
  }
  var mut = mutate(collectName);
  mutateQueue.push(mut)
  return mut;
}

const ExtendedEvents = {
    'iframe': (metric, fnc, param)  =>{
      getMutate(metric).customMutation((state, el)=> {
        if (param !== 'focus') return trackWarning({metric, message:`Listening to iframe:${param} not supported, did you intend iframe:focus`});
        window.addEventListener('blur', function (e) {
          if (document.activeElement == el) {
            fnc(null,el);
          }
        })
      })
    },
    'scroll': (metric, fnc, option, percent=10) =>{
      let isSpeed = option === 'speed';
      let threshold = Number(isSpeed ?percent :(percent || option))
      let lastScrollTop = window.scrollY;

      window.addEventListener("scroll", () => {
        let scrollTop = window.scrollY;
        let docHeight = document.body.offsetHeight;
        let winHeight = window.innerHeight;
        let scrollPercent = scrollTop / (docHeight - winHeight);
        if (isSpeed){
          let ySpeed = scrollTop - lastScrollTop;
          lastScrollTop = scrollTop;
          if (threshold < 0 
            ?(threshold > ySpeed)
            :(threshold < ySpeed)
          ){
            fnc(null, window);
          }
        } else if (100*scrollPercent >= threshold){
          fnc(null, window);
        }
      });
    },
    'mouseexit': (metric, fnc, area, distance=0) =>{
      let isTop = area === 'top';
      let threshold = Number(isTop ?distance :(distance || area)) || 0;
      window.addEventListener('mouseout', (e)=> {
        if (isTop){
          if (e.clientY <= 0 || (e.clientY <= threshold && e.clientX <= 0) || (e.clientY <= threshold && e.clientX >= window.innerWidth)){
            fnc(null,e.target)
          }
        } else if (e.clientY <= 0 || e.clientY >= window.innerHeight || e.clientX <= 0 || e.clientX >= window.innerWidth){
          fnc(null,e.target);
        }
      });
    },
    'idle': (metric, fnc, param=60000)=>{
      let idleTimer;
      function idle(){
        fnc(null, {})
      }
      function resetIdleTimer(){
        clearTimeout(idleTimer);
        idleTimer = setTimeout(idle, param)
      }
      ['mousemove', 'touchstart', 'keydown'].forEach(event => {
        window.addEventListener(event, resetIdleTimer);
      });
      resetIdleTimer();
    },
    'wait': (metric, fnc, param=5000) =>{
      setTimeout(
        ()=>fnc(null, window),
        Math.max(Number(param) - (performance?.now() || 0), 0)
      );
    }
};

let inc = 0
function genUniqueName(tag=''){
  return `metric-${tag}-${inc++}`
}

export let ObservableQueue = [];

function defaultObservable(metric, context){
  function startListening(fnc){
    if (checkWhen(metric.when, context)){
      var val = getValue(metric);
      if (isValidValue(val) && !metric.subscribe){
        fnc(val, null)
        return;
      }
    }
    if (!supportPolling(metric)){
      if (isValidValue(metric.default)){
        fnc(metric.default, metric.default);
      }
      return;
    } else {
      var pollingCount = 0;
      var foundValue = false;
      var cachedValue;

      var poll = setInterval(function(){
        try{
          if (!checkWhen(metric.when, context)) return;
          var val = getValue(metric);
          pollingCount++;

          if (isValidValue(val) && cachedValue !== val){
            cachedValue = val;
            foundValue = true;
            fnc(val, val);
            if (!metric?.subscribe) removePoll(poll);
          }
        } catch(e){trackWarning({metric, error: e, message:'metric processing exception'});}
      }, metric?.subscribe?.interval || metric?.poll?.interval || 50);

      addPoll(poll);
      setTimeout(function(){
        removePoll(poll)

        if (!foundValue && metric.default) {
          fnc(metric.default, metric.default);
        }
      }, metric?.subscribe?.duration || metric?.poll?.duration || 250);
    }
  }
  return {
    subscribe: startListening
  }
}

export const Observables = {
    dom(metric){
      function listenForDOM(fnc){
        if (metric.on){
          const isExtended = t=> t.includes(':');
          let eventTokens = metric.on.split(' ');
          let extendedEventTokens = eventTokens.filter(t=> isExtended(t));
          let normalEvents        = eventTokens.filter(t=> !isExtended(t));

          //mutate lib can only handle one event at a time
          normalEvents.forEach(ev=> getMutate(metric).listen(ev, el=> fnc(null, el.target)));

          extendedEventTokens.forEach(t=>{
            let tokens = t.split(':');
            let extendedEvent = ExtendedEvents[tokens[0]];
            if (tokens.length >= 2 && extendedEvent){
              extendedEvent(metric, fnc, tokens[1], tokens[2]);
            } else {
              trackWarning({metric, message: `event ${t} is an invalid extended event`})
            }
          });
        } else {
          let mutation = (state, el)=> fnc(null, el);
          getMutate(metric).customMutation(mutation, mutation);
        }
      }
      return {
        subscribe: listenForDOM
      };
    },
    onAsync(metric){
      function listen(fnc){

        if (!metric.on ){
          if (metric.data){//We already had event
            return fnc(null, metric.data);
          } else {
            return trackWarning({metric, message: "on-async requires attribute 'on'"});
          }
        }

        let obj = adapters.getExpressionValue(metric.key);

        if (!obj.on || typeof obj.on != 'function') return trackWarning({metric, message: "on-async object from '${metric.key}' did not have method 'on'"});

        function handler(){
          fnc(null, {params:arguments})
        }

        obj.on(metric.on, handler);
      }
      return {
        subscribe: listen
      }
    },
    expression(metric, context){
      let base = defaultObservable(metric, context);
      function listen(fnc){
          base.subscribe(val=>{
            if (typeof val === 'function') {
              let asyncFnc = val;
              if (!metric.on ){
                if (metric.data){//We already had event
                  return fnc(null, metric.data);
                } else {
                  return trackWarning({metric, message: "async function requires attribute 'on'"});
                }
              }
              function handler(...args){
                fnc(null, {params:args})
              }
              asyncFnc(metric.on, handler);
            } else {
              //default syncrounous expression
              fnc(val, val);
            }
          });
      }
      return {
        subscribe: listen
      }
    }
}

export function clearSubscriptions(){

}

export function observeSource(metric, context={}){
    const {source, key} = metric
    switch(source){
      case 'dom':       return Observables.dom(metric, context);
      case 'expression':  return Observables.expression(metric, context);
      // case 'on-async':  return Observables.onAsync(metric, context);
      case 'on-async':  return Observables.expression(
                          {...metric,
                            source: 'expression',
                            key: `${metric.key}.on`
                          },
                          context);
      case 'extension': if (metric.key === 'page') return Observables.dom({...metric, key:"html"}, context);
      default:          return  Observables[source]
                              ? Observables[source](metric, context)
                              : defaultObservable(metric, context);
    }
}
