import { ethErrors } from 'eth-rpc-errors';

import { KasperiaProvider } from './index';
import ReadyPromise from '@/content-script/pageProvider/readyPromise';
import BroadcastChannelMessage from '@/content-script/message/boardcastMessage';

class PushEventHandlers {
  provider: KasperiaProvider;
  _kasperiaProviderPrivate:any;

  constructor(provider: KasperiaProvider, _kasperiaProviderPrivate: {
    _selectedAddress: string | null;
    _network: string | null;
    _isConnected: boolean;
    _initialized: boolean;
    _isUnlocked: boolean;
    _pushEventHandlers: PushEventHandlers | null;
    _requestPromise: ReadyPromise;
    _bcm: BroadcastChannelMessage
  }) {
    this.provider = provider;
    this._kasperiaProviderPrivate = _kasperiaProviderPrivate;
  }

  _emit(event: string| symbol, data: any) {
    if (this._kasperiaProviderPrivate._initialized) {
      this.provider.emit(event, data);
    }
  }

  connect = (data: any) => {
    if (!this._kasperiaProviderPrivate._isConnected) {
      this._kasperiaProviderPrivate._isConnected = true;
      this._kasperiaProviderPrivate._state.isConnected = true;
      this._emit('connect', data);
    }
  };

  unlock = () => {
    this._kasperiaProviderPrivate._isUnlocked = true;
    this._kasperiaProviderPrivate._state.isUnlocked = true;
  };

  lock = () => {
    this._kasperiaProviderPrivate._isUnlocked = false;
  };

  disconnect = () => {
    this._kasperiaProviderPrivate._isConnected = false;
    this._kasperiaProviderPrivate._state.isConnected = false;
    this._kasperiaProviderPrivate._state.accounts = null;
    this._kasperiaProviderPrivate._selectedAddress = null;
    const disconnectError = ethErrors.provider.disconnected();

    this._emit('accountsChanged', []);
    this._emit('disconnect', disconnectError);
    this._emit('close', disconnectError);
  };

  accountsChanged = (accounts: string[]) => {
    if (accounts?.[0] === this._kasperiaProviderPrivate._selectedAddress) {
      return;
    }

    this._kasperiaProviderPrivate._selectedAddress = accounts?.[0];
    this._kasperiaProviderPrivate._state.accounts = accounts;
    this._emit('accountsChanged', accounts);
  };

  networkChanged = ({ network } : {network: any}) => {
    this.connect({});

    if (network !== this._kasperiaProviderPrivate._network) {
      this._kasperiaProviderPrivate._network = network;
      this._emit('networkChanged', network);
    }
  };
}

export default PushEventHandlers;
