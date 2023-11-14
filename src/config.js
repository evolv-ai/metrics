
function extractMacroDefinitions(config){
  return config.apply.reduce((a,c)=>{
    let {defmacros} = c;
    if (defmacros){
      return {...a, ...defmacros};
    } else {
      return a;
    }
  },{});
}

function applyMacros(config, macros, level){
  let nextLevel = level-1;
  if (level <= 0) return config;

  if (Array.isArray(config)) return config.map(c=>applyMacros(c,macros, level));
  
  if (typeof config != 'object') return config;

  let {macro, ...baseConfig} = config;
  let transformedConfig = Object.keys(baseConfig).reduce((a,k)=> (
    {...a, [k]:applyMacros(config[k], macros, nextLevel)}
  ),{});

  return macro
       ? {...macros[macro], ...transformedConfig}
       : transformedConfig;
}

export function prepareMacros(config){
    let macros = extractMacroDefinitions(config);
    let macroKeys = Object.keys(macros);
    
    if (macroKeys.length === 0) return config;
    return applyMacros(config, macros, 3);
}

export function mergeConfigs(config){
  var baseConfigKeys = Object.keys(config).filter(s=>/^_/.test(s))

  if (baseConfigKeys.length > 0){
    let topConfigKeys = Object.keys(config).filter(s=>!/^_/.test(s))
    let topConfig = topConfigKeys.reduce((a,k)=>({...a, [k]: config[k]}),{});

    return {
        apply: baseConfigKeys.reduce((a,k)=>[...a, config[k]],[topConfig])
    };
  } else {
    return config;
  }
}

export function prepareConfig(config){
  return prepareMacros(mergeConfigs(config));
}
