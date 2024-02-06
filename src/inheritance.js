
const clearsKey = [
    'source',
    // 'when'
]

export function mergeMetric(context, metric){
    let {key, apply, eval_now, value, comment, when, ...baseContext} = context;

    if (eval_now){
      baseContext = {...baseContext, on:null};
    }
    // console.info('mergeMetric', metric, context, baseContext)
    if (Object.keys(metric).some(k=> clearsKey.includes(k))){
        return {...baseContext, ...metric}
    } else {
        return {...baseContext, key, ...metric}
    }
}
