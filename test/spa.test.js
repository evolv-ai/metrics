
import { instrumentSpaEvent } from "../src/spa";


test('no return', () => {
  expect(instrumentSpaEvent('test')).toBe(undefined);
});

