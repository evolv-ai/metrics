import { resetTracking } from "../src/track";
import { initializeObservables, resetObservables } from "../src/observables";


let mutateObj = {
  listen: jest.fn(()=>mutateObj),
  on: jest.fn(()=>mutateObj),
  customMutation: jest.fn(()=> mutateObj),
  revert: jest.fn(()=>mutateObj)
};

const event = jest.fn(x=>x);
const bind = jest.fn(x=>x);
const get = jest.fn(()=>undefined);
const collect = jest.fn(x=>x);
const mutate = jest.fn(()=>mutateObj);
const scope = jest.fn(()=>({collect,mutate}));

collect.scope = scope;

export const Mocked = {
  event: event.mock,
  bind: bind.mock,
  get: get.mock,
  collect: collect.mock,
  mutate: mutate.mock,
  scope: scope.mock,
  mutateObj:{
    get listen(){ return mutateObj.listen.mock},
    on: mutateObj.on.mock,
    customMutation:  mutateObj.customMutation.mock,
    revert: mutateObj.revert.mock
  }
};

export const evolv = window.evolv = {
  client: {emit: event},
  context: {set: bind, get},
  collect, mutate
};

export function afterTest(){
  jest.clearAllMocks();
  jest.clearAllTimers();
  resetTracking();
  resetObservables();
}

export function beforeTest(){
    resetTracking();
    initializeObservables();

    Mocked = {
      event: event.mock,
      bind: bind.mock,
      get: get.mock,
      collect: collect.mock,
      mutate: mutate.mock,
      scope: scope.mock,
      mutateObj:{
        get listen(){ return mutateObj.listen.mock},
        on: mutateObj.on.mock,
        customMutation:  mutateObj.customMutation.mock,
        revert: mutateObj.revert.mock
      }
    };
}
