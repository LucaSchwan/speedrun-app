/* eslint-disable @typescript-eslint/no-explicit-any */
interface Error {
  message: string;
  status?: number;
  innerError?: unknown;
}

export default class Result<T> {
  result: T | null;

  error: Error | null;

  constructor(result?: T, error?: Error) {
    this.result = result ?? null;
    this.error = error ?? null;
  }

  static fromResult(result: any): Result<any> {
    return new Result(result, null);
  }

  static fromError(error: Error) {
    return new Result(null, error);
  }

  static fromErrorMessage(message: string) {
    return new Result(null, { message });
  }
}
