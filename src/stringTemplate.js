import { adapters } from "./adapters";

export function parseTemplateString(str, context) {
  var tokenize = /((\${([^}]*)})|([^${}])+)/g;
  var extract = /\${([^}]*)}/;
  var tokens = str.match(tokenize);

  if (!context) return str;

  var instantiateTokens = function (accum, str) {
    var parsed = str.match(extract);

    return (
      accum + (parsed ? adapters.getExpressionValue(parsed[1], context) : str)
    );
  }.bind(this);

  return tokens.reduce(instantiateTokens, "");
}
