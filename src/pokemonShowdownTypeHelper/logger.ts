export class Logger {
  static readonly MESSAGE_PREFIX = "[Pokemon Showdown Type Helper]";

  static debug(...args: any[]) {
    console.debug(Logger.MESSAGE_PREFIX, ...args);
  }

  static log(...args: any[]) {
    console.log(Logger.MESSAGE_PREFIX, ...args);
  }
}
