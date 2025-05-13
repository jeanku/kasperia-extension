/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
class ReadyPromise {
  private _allCheck: boolean[] = [];
  private _tasks: {
    resolve(value: unknown): void;
    fn(): Promise<any>;
  }[] = [];

  constructor(count: number) {
    this._allCheck = [...Array(count)];
  }

  check = (index: number) => {
    this._allCheck[index - 1] = true;
    this._proceed();
  };

  uncheck = (index: number) => {
    this._allCheck[index - 1] = false;
  };

  private _proceed = () => {
    if (this._allCheck.some((_) => !_)) {
      return;
    }

    while (this._tasks.length) {
      const { resolve, fn } = this._tasks.shift()!;
      resolve(fn());
    }
  };

  call = (fn: any) => {
    return new Promise((resolve) => {
      this._tasks.push({
        fn,
        resolve
      });

      this._proceed();
    });
  };
}

export default ReadyPromise;
