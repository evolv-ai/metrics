import { instrumentSpaEvent } from "../src/spa";

const spaTag = "test";

instrumentSpaEvent(spaTag);

test("spa event occurs on pushState", () => {
  window.location.href = "#/";
  let spaFnc = jest.fn((x) => x);

  window.addEventListener(spaTag, spaFnc);
  window.history.pushState({}, "", "#/test1");

  expect(spaFnc).toBeCalled();
});

test("spa event occurs on replaceState", () => {
  window.location.href = "#/";
  let spaFnc = jest.fn((x) => x);

  window.addEventListener(spaTag, spaFnc);
  window.history.replaceState({}, "", "#/test2");

  expect(spaFnc).toBeCalled();
});

test("spa event does not occur on pushState with no change", () => {
  window.location.href = "#/";

  let spaFnc = jest.fn((x) => x);

  window.addEventListener(spaTag, spaFnc);
  window.history.pushState({}, "", "#/");

  expect(spaFnc).not.toBeCalled();
});

test("spa event does not occur on pushState with no url", () => {
  window.location.href = "#/";

  let spaFnc = jest.fn((x) => x);

  window.addEventListener(spaTag, spaFnc);
  window.history.pushState({}, "");

  expect(spaFnc).not.toBeCalled();
});

test("spa event does not occur on replaceState with no change", () => {
  window.location.href = "#/";

  let spaFnc = jest.fn((x) => x);

  window.addEventListener(spaTag, spaFnc, "#/");
  window.history.replaceState({}, "");

  expect(spaFnc).not.toBeCalled();
});

test("spa event does not occur on replaceState with no url", () => {
  window.location.href = "#/";

  let spaFnc = jest.fn((x) => x);

  window.addEventListener(spaTag, spaFnc);
  window.history.replaceState({}, "");

  expect(spaFnc).not.toBeCalled();
});
