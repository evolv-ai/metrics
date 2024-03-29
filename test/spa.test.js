
import { instrumentSpaEvent } from "../src/spa";


test('spa event occurs on pushState', () => {
  let spaFnc = jest.fn(x=>x);
  instrumentSpaEvent('test');

  window.addEventListener('test', spaFnc)
  window.history.pushState('/', 'comment');

  expect(spaFnc).toBeCalled();
});


test('spa event occurs on replaceState', () => {
  let spaFnc = jest.fn(x=>x);
  instrumentSpaEvent('test');

  window.addEventListener('test', spaFnc)
  window.history.replaceState('/', 'comment');

  expect(spaFnc).toBeCalled();
});
