var WalletInterface = require('../interface/walletInterface');
var WalletConnect = require('@walletconnect/browser').default;
var Provider = require('../provider');

const SIGNALER_URL = 'https://bridge.walletconnect.org';
const ERROR = 'The connection was expired';


class Trust extends WalletInterface {
  constructor(net, type, restrict) {
    super(net, type, restrict);

    this.walletConnector = new WalletConnect({ bridge: SIGNALER_URL });
    this.walletConnector.preventDuplicatedEvents = false;

    this.walletConnector.on('session_update', (er, re) => {
      console.log('RtcUpdatedEvent', er, re);
    });
    this.walletConnector.on('disconnect', (er, re) => {
      console.log('RtcClosedEvent');
      this.walletConnector.preventDuplicatedEvents = false;
    });
  }

  setAccountByTrustWallet = (getAuthentication, callback) => {
    let createProvider = () => {
      this.provider = new Provider.HybridWallet(this.net);
      let accOpts = {
        getAddress: this.getAddress,
        signTransaction: this.signTransaction,
        killSession: this.killSession
      }
      this.provider.init(accOpts, (er, web3) => {
        if (er) return callback(er, null);
        this.web3 = web3;
        return callback(null, web3);
      });
    }
    if (this.walletConnector.connected) {
      // Prevent double calls
      if (this.walletConnector.preventDuplicatedEvents) return;
      this.walletConnector.preventDuplicatedEvents = true;
      return createProvider();
    }
    else {
      this.walletConnector.createSession().then(() => {
        let code = this.walletConnector.uri;
        return getAuthentication.open(code, (er, re) => {
          // User close authentication modal
          if (er) return callback(er, null);
        });
      });
      this.walletConnector.on('connect', (er, re) => {
        if (er) return callback(er, null);
        // Prevent double calls
        if (this.walletConnector.preventDuplicatedEvents) return;
        this.walletConnector.preventDuplicatedEvents = true;
        getAuthentication.close();
        return createProvider();
      });
    }
  }

  getAccountsByTrustWallet = (callback) => {
    return this.getAddress((er, re) => {
      if (er) return callback(er, null);
      return (null, [re]);
    });
  }

  getAddress = (callback) => {
    if (this.walletConnector.connected) {
      return callback(null, this.walletConnector.accounts[0]);
    } else {
      return callback(ERROR, null);
    }
  }

  signTransaction = (txParams, callback) => {
    if (this.walletConnector.connected) {
      this.walletConnector.signTransaction(txParams).then(re => {
        return callback(null, re);
      }).catch(er => {
        return callback(er, null);
      });
    }
    else {
      return callback(ERROR, null);
    }
  }

  killSession = () => {
    window.localStorage.removeItem('walletconnect');
    this.walletConnector.killSession();
  }
}

module.exports = Trust;