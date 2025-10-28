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
      if (r._type_ === `${this._EVENT_PRE}message`) {
        this.emit('message', r);
        return;
      }
      if (r._type_ === `${this._EVENT_PRE}response`) {
        this.onResponse(r.data);
      }
    });
    return this;
  };

  listen = (listenCallback: any) => {
    if (!this.port) return;
    this.listenCallback = listenCallback;
    this.port.onMessage.addListener(({ _type_, data }: {_type_: string, data: any}) => {
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
