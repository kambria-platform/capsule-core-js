var WalletInterface = require('../interface/walletInterface');
import WalletConnect from '@walletconnect/client';
var Provider = require('../provider');

const SIGNALER_URL = 'https://bridge.walletconnect.org';
const ERROR = 'The connection was expired';


class Trust extends WalletInterface {
  /**
   * Constructor
   * @param {*} net 
   * @param {*} options - extra options for specific wallets
   * getAuthentication
   * getApproval
   */
  constructor(net, options) {
    super(net, 'hybridwallet');

    /**
     * Init options
     */
    const { getAuthentication, getApproval } = options;
    if (!getAuthentication || !getApproval) throw new Error('Invalid options');
    this.getAuthentication = getAuthentication;
    this.getApproval = getApproval;

    this.walletConnector = new WalletConnect({ bridge: SIGNALER_URL });
    this.walletConnector.preventDuplicatedEvents = false;
    this.walletConnector.on('session_update', (er, re) => {
      return console.log('RtcUpdatedEvent', er, re);
    });
    this.walletConnector.on('disconnect', (er, re) => {
      this.walletConnector.preventDuplicatedEvents = false;
      return console.log('RtcClosedEvent');
    });
  }

  /**
   * @func _setWallet
   * (Internal function) Set up coinbase
   * @param {*} accOpts 
   */
  _setWallet = (accOpts, callback) => {
    this.provider = new Provider.HybridWallet(this.net);
    accOpts.approveTransaction = this.getApproval;
    return this.provider.init(accOpts, (er, web3) => {
      if (er) return callback(er, null);
      this.web3 = web3;
      return callback(null, web3);
    });
  }

  setAccountByTrustWallet = (callback) => {
    const accOpts = {
      getAddress: this.getAddress,
      signTransaction: this.signTransaction,
      killSession: this.killSession
    }

    if (this.walletConnector.connected) {
      // Prevent double calls
      if (this.walletConnector.preventDuplicatedEvents) return;
      this.walletConnector.preventDuplicatedEvents = true;
      return this._setWallet(accOpts, callback);
    }

    this.walletConnector.createSession().then(() => {
      const code = this.walletConnector.uri;
      return this.getAuthentication.open(code, (er, re) => {
        // User close authentication modal
        if (er) return callback(er, null);
      });
    });
    return this.walletConnector.on('connect', (er, re) => {
      if (er) return callback(er, null);
      // Prevent double calls
      if (this.walletConnector.preventDuplicatedEvents) return;
      this.walletConnector.preventDuplicatedEvents = true;
      this.getAuthentication.close();
      if (!re || !re.params || !re.params[0] || !re.params[0].chainId)
        return callback('There is no wallet account', null);
      const chainId = re.params[0].chainId;
      if (this.net !== chainId) return callback('Invalid network', null);
      return this._setWallet(accOpts, callback);
    });
  }

  getAccountsByTrustWallet = (callback) => {
    return this.getAddress((er, re) => {
      if (er) return callback(er, null);
      return (null, [re]);
    });
  }

  getAddress = (callback) => {
    if (this.walletConnector.connected)
      return callback(null, this.walletConnector.accounts[0]);
    return callback(ERROR, null);
  }

  signTransaction = (txParams, callback) => {
    if (this.walletConnector.connected)
      return this.walletConnector.signTransaction(txParams).then(re => {
        return callback(null, re);
      }).catch(er => {
        return callback(er, null);
      });
    return callback(ERROR, null);
  }

  killSession = () => {
    return this.walletConnector.killSession();
  }
}

module.exports = Trust;