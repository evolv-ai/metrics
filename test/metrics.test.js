
import { processConfig } from "../src/metrics";


test('empty config', () => {
  window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

  expect(processConfig({apply:[]}));
});


//add tests for macro usage
// test('config with macro processing in a base config', () => {
//   window.evolv = {collect: {scope : name=>({collect:()=>'test', mutate:()=>'test'})}};;

//   expect(processConfig({apply:[]}));
// });