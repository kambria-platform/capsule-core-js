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
   */
  constructor(net, opts) {
    const rpc = getRPC(net);
    if (!rpc) throw new Error(error.CANNOT_CONNECT_RPC);
    if (!opts) opts = {};

    this.RPC = rpc;
    this.dataHandler = (!opts.dataHandler || typeof opts.dataHandler !== 'function') ? _defaut.dataHandler : opts.dataHandler;
    this.errorHandler = (!opts.errorHandler || typeof opts.errorHandler !== 'function') ? _defaut.errorHandler : opts.errorHandler;
    this.getAccounts = (!opts.getAccounts || typeof opts.getAccounts !== 'function') ? _defaut.getAccounts : opts.getAccounts;
    this.approveTransaction = (!opts.approveTransaction || typeof opts.approveTransaction !== 'function') ? _defaut.approveTransaction : opts.approveTransaction;
    this.signTransaction = (!opts.signTransaction || typeof opts.signTransaction !== 'function') ? _defaut.signTransaction : opts.signTransaction;

    const providerEngine = ZeroClientProvider({
      rpcUrl: rpc,
      getAccounts: this.getAccounts,
      approveTransaction: this.approveTransaction,
      signTransaction: this.signTransaction
    });

    this.web3 = new Web3(providerEngine);

    providerEngine.on('block', (block) => {
      this.dataHandler(block);
    });
    providerEngine.on('error', (er) => {
      this.errorHandler(er);
    });
  }
}

module.exports = Zeroc;