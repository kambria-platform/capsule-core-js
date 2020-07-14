var Engine = require('./engine').zeroc;
var util = require('../util');
const error = require('../constant/error');

class HybridWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   * @param {*} accOpts - accOpts = {
   *   signTransaction: (function) ...
   *   getAddress: (function) ...
   * }
   */
  constructor(net) {
    this.network = util.getNetworkId(net, 'number');
  }

  /**
   * @func opts
   * Define optional functions for engine
   */
  opts = () => {
    return {
      dataHandler: () => { /* Turn off default logs */ },
      errorHandler: () => { /* Turn off default logs */ },
      getAccounts: (callback) => {
        this.getAddress((er, addr) => {
          if (er) return callback(er, null);
          if (!addr) return callback(null, []);
          return callback(null, [addr.toLowerCase()]);
        })
      },
      approveTransaction: (txParams, callback) => {
        this.approveTransaction(txParams, (er, approved) => {
          if (er || !approved) return callback(error.USER_DENIED_TX, false);
          return callback(null, true);
        });
      },
      signTransaction: (txParams, callback) => {
        txParams.chainId = this.network;
        if (!txParams.data) txParams.data = '0x';
        console.log(txParams)
        this.signTransaction(txParams, (er, signature) => {
          if (er) return callback(er, null);
          let signedTx = util.genSignedTx(signature);
          return callback(null, signedTx);
        });
      },
      killSession: () => {
        this.killSession();
      }
    }
  }

  /**
   * @func init
   * Initialize web3 
   * @param {*} accOpts 
   * @param {*} callback 
   */
  init = (accOpts, callback) => {
    accOpts = accOpts || {};
    console.log(accOpts)
    let ok = this.setAccount(accOpts);
    if (!ok) return callback(error.CANNOT_SET_ACCOUNT, null);
    let engine = new Engine(this.network, this.opts());
    // We used callback to fomalize code interface with other classes
    return callback(null, engine.web3);
  }

  /**
   * @func setAccount
   * Set up coinbase
   * @param {*} getAddress
   * @param {*} approveTransaction
   * @param {*} signTransaction
   * @param {*} killSession
   */
  setAccount = (accOpts) => {
    let { getAddress, approveTransaction, signTransaction, killSession } = accOpts;
    if (!getAddress || typeof getAddress !== 'function') {
      console.error('getAddress must be a function');
      return false;
    }
    if (!approveTransaction || typeof approveTransaction !== 'function') {
      console.error('approveTransaction must be a function');
      return false;
    }
    if (!signTransaction || typeof signTransaction !== 'function') {
      console.error('signTransaction must be a function');
      return false;
    }
    if (!killSession || typeof killSession !== 'function') {
      console.error('killSession must be a function');
      return false;
    }

    this.getAddress = getAddress;
    this.approveTransaction = approveTransaction;
    this.signTransaction = signTransaction;
    this.killSession = killSession;
    return true;
  }
}

module.exports = HybridWallet;