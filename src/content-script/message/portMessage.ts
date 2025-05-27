/* eslint-disable @typescript-eslint/no-explicit-any */
import { browserRuntimeConnect } from './browser';

import Message from './index';

class PortMessage extends Message {
  port: any | null = null;
  listenCallback: any;

  constructor(port?: any) {
    super();

    if (port) {
      this.port = port;
    }
  }

  connect = (name?: string) => {
    this.port = browserRuntimeConnect(undefined, name ? { name } : undefined);
    this.port.onMessage.addListener((r: any) => {
      console.log("r", r)
      // if (_type_ === `${this._EVENT_PRE}message`) {
      //   this.emit('message', data);
      //   return;
      // }
      //
      if (r._type_ === `${this._EVENT_PRE}response`) {
        this.onResponse(r);
      }
    });

    return this;
  };

  listen = (listenCallback: any) => {
    if (!this.port) return;
    this.listenCallback = listenCallback;
    this.port.onMessage.addListener((message: any) => {
      const { _type_, data } = message || {};
      if (_type_ === `${this._EVENT_PRE}request`) {
        this.onRequest(data);
      }
    });
    return this;
  };

  send = (type: string, data: any) => {
    if (!this.port) return;
    try {
      this.port.postMessage({ _type_: `${this._EVENT_PRE}${type}`, data });
    } catch (e) {
      // DO NOTHING BUT CATCH THIS ERROR
    }
  };

  dispose = () => {
    this._dispose();
    this.port?.disconnect();
  };
}

export default PortMessage;
