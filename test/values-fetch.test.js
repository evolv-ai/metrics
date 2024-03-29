import { convertValue, getValue } from "../src/values";
import { resetTracking } from "../src/track";

function getConvertedValue(metric, target){
    let value = getValue(metric, target)
    if (!value) return undefined;
    return convertValue(value, metric.type);
}

  beforeEach(() => {
    window.evolv = {metrics:{}}
    resetTracking();
  });


//simple expressions

test('expression fetch value', () => {
    window.fetch = function(){
      return {
        then: (fnc)=>{
          let res = fnc({json:()=>'{"val": "testFetch"}'})
          return {
            then:(fnc)=> fnc({data:res})
          }
        }
      }
    }
    let metric = {source: "fetch", "key": '', extract:{expression:'val'}};
    expect(getConvertedValue(metric)).toBe('testFetch');
});
