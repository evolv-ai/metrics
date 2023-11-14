
export function initializeTracking(){
    window.evolv.metrics = window.evolv.metrics || {executed: [], evaluating: []};  
}

export function trackEvaluating(metric){
    window.evolv.metrics.evaluating.push(metric);
}

export function trackExecuted(metric){
    window.evolv.metrics.executed.push(metric)
}

export function trackWarning(warn){
    window.evolv.metrics.warnings = window.evolv.metrics.warnings || [];
    window.evolv.metrics.warnings.push(warn);
}

export function resetTracking(){
    window.evolv.metrics = {executed: [], evaluating: []};  
}
