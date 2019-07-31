var WalletInterface = require('../interface/walletInterface');
var WalletConnect = require('@walletconnect/browser').default;
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
    let { getAuthentication, getApproval } = options;
    if (!getAuthentication || !getApproval) throw new Error('Invalid options');
    this.getAuthentication = getAuthentication;
    this.getApproval = getApproval;

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

  /**
   * @func setWallet
   * (Internal function) Set up acc to storage that can be used as a wallet
   * @param {*} accOpts 
   */
  setWallet = (accOpts, callback) => {
    this.provider = new Provider.HybridWallet(this.net);
    accOpts.approveTransaction = this.getApproval;
    this.provider.init(accOpts, (er, web3) => {
      if (er) return callback(er, null);
      this.web3 = web3;
      return callback(null, web3);
    });
  }

  setAccountByTrustWallet = (callback) => {
    if (this.walletConnector.connected) {
      // Prevent double calls
      if (this.walletConnector.preventDuplicatedEvents) return;
      this.walletConnector.preventDuplicatedEvents = true;
      let accOpts = {
        getAddress: this.getAddress,
        signTransaction: this.signTransaction,
        killSession: this.killSession
      }
      return this.setWallet(accOpts, callback);
    }
    else {
      this.walletConnector.createSession().then(() => {
        let code = this.walletConnector.uri;
        return this.getAuthentication.open(code, (er, re) => {
          // User close authentication modal
          if (er) return callback(er, null);
        });
      });
      this.walletConnector.on('connect', (er, re) => {
        if (er) return callback(er, null);
        // Prevent double calls
        if (this.walletConnector.preventDuplicatedEvents) return;
        this.walletConnector.preventDuplicatedEvents = true;
        this.getAuthentication.close();
        let accOpts = {
          getAddress: this.getAddress,
          signTransaction: this.signTransaction,
          killSession: this.killSession
        }
        return this.setWallet(accOpts, callback);
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