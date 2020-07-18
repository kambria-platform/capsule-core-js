var Engine = require('./engine').zeroc;
var ethTx = require('ethereumjs-tx').Transaction;
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
        return this.getAddress((er, addr) => {
          if (er) return callback(er, null);
          if (!addr) return callback(null, []);
          return callback(null, [addr.toLowerCase()]);
        })
      },
      approveTransaction: (txParams, callback) => {
        return this.approveTransaction(txParams, (er, approved) => {
          if (er || !approved) return callback(error.USER_DENIED_TX, false);
          return callback(null, true);
        });
      },
      signTransaction: (txParams, callback) => {
        txParams.chainId = this.network;
        if (!txParams.data) txParams.data = '0x';
        if (!txParams.value) txParams.value = '0x00';
        return this.signTransaction(txParams, (er, signature) => {
          if (er) return callback(er, null);
          const signedTx = new ethTx(signature, { chain: this.network });
          return callback(null, util.padHex(signedTx.serialize().toString('hex')));
        });
      },
      killSession: () => {
        return this.killSession();
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
    const ok = this.setAccount(accOpts);
    if (!ok) return callback(error.CANNOT_SET_ACCOUNT, null);
    const engine = new Engine(this.network, this.opts());
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
    const { getAddress, approveTransaction, signTransaction, killSession } = accOpts;
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