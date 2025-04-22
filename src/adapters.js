'use strict';
import { trackWarning } from "./track";
import { parseExpression } from "./expressionParser";

var OperatorSet = {
  //array operators
  join: function(context, tokens, params){
    let array = context;
    if (!array) return undefined;

    var delim = params[0] || '|';
    return array
      .map(n=>processExpression(tokens, n))
      .filter(x=>x)
      .join(delim);
  },
  values: function(context, tokens, params){
    let obj = context;
    if (!obj) return null;
    var array = Object.values(obj);
    return array
  },
  at: function(context, tokens, params){
    let array = Array.from(context);
    let index = Number(params.join(''))
    if (!array) return null;
    return processExpression(tokens, array.at(index));
  },
  sum: function(context, tokens){
    let array = context;
    if (!array) return undefined;

    return array.reduce((a,n)=>
      a + (processExpression(tokens, n) || 0),
      0
    );
  },
  count: function(context, tokens){
    let array = context || [];
    return array.reduce((a,n)=>
      a + ((processExpression(tokens, n) && 1) || 0),
      0
    );
  },
  negate: function(context, tokens){

  },
  filter: function(context, tokens, params){
    // var array = token ? context[token] : context;
    let array = context || [];

    if (!array) return undefined;

    let [key, value] = params;
    if (value){
      const valueMatch = value.match(/'(.*)'/) || value.match(/"(.*)"/)
      if (valueMatch?.[1]){
        value = valueMatch[1];
      }
    }
    const valRegex = new RegExp(value );

    function testValue(n){
      return n[key] && !!valRegex.test(adapters.getExpressionValue(key, n))
    }
    return array.filter(testValue)
  },
  promise: function(context, tokens, param){
    // var fnc = context[token];
    var fnc = context;

    if (!fnc) return undefined;

    let noop = x=>x;
    let promiseHandler = param || 'then';

    return (ev,cb)=>{
      if (promiseHandler === 'then'){
        fnc.apply(context, [ev]).then(cb).catch(noop);
      } else {
        fnc.apply(context, [ev]).then(noop).catch(cb);
      }
    }
  }
};

function tokenizeExp(exp){
  return Array.isArray(exp) ? exp : exp.split('.');
}

function getDistribution(){
   return Math.floor(Math.random()*100);
};

function processOperator(exp, result, tokens){
  var [operatorToken, ...params] = exp;
  operatorToken = operatorToken.slice(1)
  var operator = OperatorSet[operatorToken];//worry about parens later
  try {
    if (!operator){
      console.warn('Metrics expression macro not available', operatorToken);
      return undefined;
    }
    return operator(result, tokens, params);
  } catch(e){
    // console.warn('fetching value failed', e);
    return undefined;
  }
}

function processInfix(exp, context, tokens){
  try {
    if (!Array.isArray(exp) ) return;
    let [operand1, operator, operand2] = exp;
    let p1 = processExpression(operand1, context);
    let p2 = processExpression(operand2, context);
    switch(operator){
      case '*': 
        return p1 * p2;      
      case '/': 
        return p1 / p2;      
      case '+': 
        return p1 + p2;      
      case '-': 
        return p1 - p2;
    }
  } catch(e){
    // console.warn('fetching value failed', e);
    return undefined;
  }
}

function processExpression(tokens, context){
  var result = context || window;
  let inMacro = false;
  if (tokens[0] === 'window') tokens = tokens.slice(1);
  while(tokens.length > 0 && result){
    var token = tokens[0];
    tokens = tokens.slice(1);

    if (inMacro && (!Array.isArray(token) || token[0].indexOf(':') !== 0)){
      return result;
    }

    if (Array.isArray(token)){
      let list = token;
      if (list[0].indexOf(':') === 0){
        result = processOperator(list, result, tokens);
        inMacro = true;
      } else {
        result = processInfix(list, result, tokens);
      }
    } else {
      let context = result;
      let params = tokens[0]

      result = result[token];

      if (typeof result === 'function'){
        if (Array.isArray(params) && Array.isArray(params[0])){
          let fnc = result;
          result = fnc.apply(context, params[0] ||[]);
          tokens = tokens.slice(1);
        } else {
          result = result.bind(context);
        }
      } // else it is a simple chained value
    }
  }
  return result;
}

export const adapters = {
  getExpressionValue(exp, context){
    let parsedExpression = parseExpression(exp)
    return processExpression(parsedExpression, context);
  },

  setExpressionValue: function(exp, values, append){
    var tokens = tokenizeExp(exp);
    var key = tokens.pop();
    var obj = adapters.getExpressionValue(tokens);

    if (!obj) return;

    if (append){
      obj[key] += values;
    } else{
      obj[key] = values;
    }
  },
  getFetchValue: function(url) {
    let fetchData = {}
    var method = fetchData.method || 'POST'
    var data  = fetchData.data || {};
    return fetch(url, {
        method: method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    })
    .then(function(response){return response.json();})
    .then(function(response){
      var data = response.data;
      return data;
    })
  },
  getCookieValue: function(name) {
    var cookie = document.cookie.split(';')
        .find(function(item) {return item.trim().split('=')[0] === name });
    if (!cookie) return null;

    return cookie.split('=')[1];
  },
  getLocalStorageValue: function(name) {
    return localStorage.getItem(name);
  },
  getSessionStorageValue: function(name) {
    return sessionStorage.getItem(name);
  },
  //#todo switch found to boolean
  getDomValue: function(sel) {
    return document.querySelector(sel)  && 'found';
  },
  //#todo switch found to boolean
  getJqDomValue: function(sel) {
    return window.$ && ($(sel).length > 0)  && 'found';
  },
  getQueryValue: function(name) {
    try{
      return new URL(location.href).searchParams.get(name);
    } catch(e){ return null;}
  },
  // onAsync: function(name) {
  //   return 'async'; //not sure what to do here
  // },
  getExtensionValue: function(name){
    switch (name) {
      case 'distribution':
        return getDistribution();
      default:
        trackWarning({name, message:"No audience extension called"});
    }
  }
}
