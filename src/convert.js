
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
      case 'array':   return (Array.isArray(val) ? val : [val]);
      default:        return val.toString();
    }
  }
  