var Web3 = require('web3');
var ZeroClientProvider = require('web3-provider-engine/zero.js');

var getRPC = require('../rpc');

const _defaut = require('./defaultFunc');
const error = require('../../constant/error');

class Zeroc {
  /**
   * 
   * @param {*} net - network ID or net work name
   * @param {*} opts - dataHandler: handle event new block
   *                   errorHandler: handle event error sync
   *                   getAccounts: return coinbase
   *                   approveTransaction: decrypt encrypted private key and pass next
   *                   signTransaction: sign raw tx
   *                   killSession: clear browser storage, disconnect to servers in case
   */
  constructor(net, opts) {
    const rpc = getRPC(net);
    if (!rpc) throw new Error(error.CANNOT_CONNECT_RPC);
    if (!opts) opts = {};

    let dataHandler = (!opts.dataHandler || typeof opts.dataHandler !== 'function') ? _defaut.dataHandler : opts.dataHandler;
    let errorHandler = (!opts.errorHandler || typeof opts.errorHandler !== 'function') ? _defaut.errorHandler : opts.errorHandler;
    let getAccounts = (!opts.getAccounts || typeof opts.getAccounts !== 'function') ? _defaut.getAccounts : opts.getAccounts;
    let approveTransaction = (!opts.approveTransaction || typeof opts.approveTransaction !== 'function') ? _defaut.approveTransaction : opts.approveTransaction;
    let signTransaction = (!opts.signTransaction || typeof opts.signTransaction !== 'function') ? _defaut.signTransaction : opts.signTransaction;
    let killSession = (!opts.killSession || typeof opts.killSession !== 'function') ? _defaut.killSession : opts.killSession;

    let engine = ZeroClientProvider({
      rpcUrl: rpc,
      getAccounts: getAccounts,
      approveTransaction: approveTransaction,
      signTransaction: signTransaction
    });
    engine.on('block', dataHandler);
    engine.on('error', errorHandler);

    /**
     * Release composing provider
     */
    this.web3 = new Web3(engine);
    this.web3.killSession = killSession;
  }
}

module.exports = Zeroc;