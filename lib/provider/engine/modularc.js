var Web3 = require('web3');
var ProviderEngine = require('web3-provider-engine');
var CacheSubprovider = require('web3-provider-engine/subproviders/cache.js');
var FixtureSubprovider = require('web3-provider-engine/subproviders/fixture.js');
var FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
var VmSubprovider = require('web3-provider-engine/subproviders/vm.js');
var HookedWalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js');
var NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js');
var RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js');

var getRPC = require('../rpc');

const _defaut = require('./defaultFunc');
const error = require('../../constant/error');

class Modularc {
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

    let engine = new ProviderEngine();
    engine.addProvider(new FixtureSubprovider({
      web3_clientVersion: 'ProviderEngine/v0.0.0/javascript',
      net_listening: true,
      eth_hashrate: '0x00',
      eth_mining: false,
      eth_syncing: true
    }));
    engine.addProvider(new CacheSubprovider());
    engine.addProvider(new FilterSubprovider());
    engine.addProvider(new NonceSubprovider());
    engine.addProvider(new VmSubprovider());
    engine.addProvider(new HookedWalletSubprovider({
      getAccounts: this.getAccounts,
      approveTransaction: this.approveTransaction,
      signTransaction: this.signTransaction
    }));
    engine.addProvider(new RpcSubprovider({
      rpcUrl: this.RPC
    }));
    engine.on('block', (block) => {
      this.dataHandler(block);
    });
    engine.on('error', (er) => {
      this.errorHandler(er);
    });
    engine.start((er) => {
      if (er) throw new Error(er);
    });

    /**
     * Release composing provider
     */
    this.web3 = new Web3(engine);
  }
}

module.exports = Modularc;