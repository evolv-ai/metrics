import { trackWarning } from "./track";

var OperatorSet = {
  //array operators
  join: function(context, token, tokens, delimeter){
    var array = context[token];
    if (!array) return undefined;
    
    var delim = delimeter || '|';
    return array
      .map(n=>adapters.getExpressionValue(tokens, n))
      .filter(x=>x)
      .join(delim);
  },
  at: function(context, token, tokens, index){
    var array = Array.from(context[token]);
    if (!array) return null;
    
    return adapters.getExpressionValue(tokens, array.at(index));
  },
  sum: function(context, token, tokens){
    var array = context[token];
    if (!array) return undefined;

    return array.reduce((a,n)=>
      a + (adapters.getExpressionValue(tokens, n) || 0),
      0
    );
  }
};

function tokenizeExp(exp){
  return Array.isArray(exp) ? exp : exp.split('.');
}

function getDistribution(){
   return Math.floor(Math.random()*100);
};

//future usage
// function initDistribution(){
//   return Math.floor(Math.random()*100);
// };

function extractFunctionParameter(token){
  var openPos = token.indexOf('(');
  if (openPos <= 0) return {name: token};

  var closingPos = token.indexOf(')');
  var param = token.slice(openPos+1, closingPos);
  var name = token.slice(0,openPos);
  return {name, param}
}

const tokenType = {
  operator: { //may only handle one level of array processing
    is: function(token, tokens){
      return token.indexOf(':') > 0;
    },
    process: function(token, result, tokens){
      var [baseToken, operatorToken] = token.split(':');
      var fnc = extractFunctionParameter(operatorToken);
      var operator = OperatorSet[fnc.name];//worry about parens later

      try {
        return operator(result, baseToken, tokens, fnc.param)
      } catch(e){
        return undefined;
      }
    }
  },
  fnc: {
    is: function(token, tokens){
      return token.indexOf('(') > 0;
    },
    process: function(token, result, tokens){
      var openPos = token.indexOf('(');
      if (openPos <= 0) return undefined;
      
      try {
        var closingPos = token.indexOf(')');
        var param = token.slice(openPos+1, closingPos);
        token = token.slice(0,openPos);
        var fnc = result[token];
    
        if (typeof fnc === 'function'){
          return fnc.apply(result, [param]);
        } else {
          return undefined;
        }
      }
      catch(e){
        return undefined;
      }
    }
  }
};

export const adapters = {
  getExpressionValue(exp, context){
    var tokens = tokenizeExp(exp);
    var result = context || window;
    
    if (tokens[0] === 'window') tokens = tokens.slice(1);

    while(tokens.length > 0 && result){
      var token = tokens[0];
      tokens = tokens.slice(1);

      if (tokenType.operator.is(token, tokens)) {
        result = tokenType.operator.process(token, result, tokens);
        tokens = [];
      } else if (tokenType.fnc.is(token, tokens)) {
        result = tokenType.fnc.process(token, result, tokens);
      } else {
        result = result[token];
      }
    }
    return result;
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
  getFetchValue: function(fetchData) {
    var url = fetchData.url || '';
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
      var expression = fetchData.expression || null;
      var store = fetchData.bindTo || null;
      var data = response.data;
      var value = adapters.getExpressionValue(expression, data);
      if (store){
        adapters.setExpressionValue(store, data);
      }
      if (!value) return '';
      
      return value.toString();
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
  onAsync: function(name) {
    return 'async'; //not sure what to do here
  },
  getExtensionValue: function(name){
    switch (name) {
      case 'distribution': 
        return getDistribution();
      default:
        trackWarning({name, message:"No audience extension called"});
    }
  }
}
