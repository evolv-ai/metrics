
import { processConfig } from "../src/metrics";


test('empty config', () => {
  window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

  expect(processConfig({apply:[]}));
});

// test('single metric config', () => {
//   });


// test('multiple metric config', () => {
// });