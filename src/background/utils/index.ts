export { default as PromiseFlow } from './promiseFlow';
export { buildEntryPayload } from './helper';

export const underline2Camelcase = (str: string) => {
  return str.replace(/_(.)/g, (m, p1) => p1.toUpperCase());
};

export const wait = (fn: () => void, ms = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn();
      resolve(true);
    }, ms);
  });
};
