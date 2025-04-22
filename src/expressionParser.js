
export function parseExpression(input) {
    let tokens = [];
    let currentToken = '';
    let inMacro = false;
    let inString = false;
    let inNumericExpression = false;
    
    function nestTokens(){
        let currentStack = tokens;
        tokens = [];
        tokens.wrapperTokens = currentStack;
        currentStack.push(tokens);
    }
    function unestTokens(){
        const nestedStack = tokens;
        tokens = tokens.wrapperTokens;
        delete nestedStack.wrapperTokens;
    }

    for (const char of input) {
      if (inString) {
        currentToken += char;
        if (char === "'") inString = false;
    } else if (char === "'") {
        inString = true;
        currentToken += char;
      } else if (char === '(' || char === ')') {
        if (currentToken) tokens.push(currentToken)

        if (char === '(' && !inMacro) {
            nestTokens();
            inNumericExpression = true;
            nestTokens();
        }
        if (char === ')'){
           unestTokens();
           if (inNumericExpression){
             inNumericExpression = false;
             unestTokens();
           }
        }
        inMacro = false;
        currentToken = '';
    } else if (char === '.') {
        if (currentToken) tokens.push(currentToken);
        if (inMacro){
            unestTokens();
            inMacro = false;
        }
        currentToken = '';
    } else if (char === ',') {
        if (currentToken) {
            tokens.push(currentToken);
        } else {
            tokens.push(',')
        }
        if (inMacro){
            unestTokens();
            inMacro = false;
        }
        currentToken = '';
    } else if (char === ':') {
        if (currentToken) tokens.push(currentToken);
        if (inMacro){
            unestTokens();
            inMacro = false;
        }
        nestTokens();
        currentToken = '' + char;
        inMacro = true;
      } else if ((char === '+' || char === '-' || char === '*' || char === '/') 
                  && !inString) {
        if (currentToken) tokens.push(currentToken);
        if (inNumericExpression){
            unestTokens();
            tokens.push(char);
            nestTokens();
            currentToken = '';
        } else {
            currentToken = '' + char;
        }
      } else {
        currentToken += char;
      }
    }
    
    if (inMacro) {
        tokens.push(currentToken)
        currentToken = '';
        unestTokens();
    }

    if (currentToken) tokens.push(currentToken);
    return tokens;
  }
  