var Web3 = require('web3');

var getRPC = require('../rpc');

const error = require('../../constant/error');

class Queryc {
  /**
   * 
   * @param {*} net - network ID or net work name
   */
  constructor(net) {
    const rpc = getRPC(net);
    if (!rpc) throw new Error(error.CANNOT_CONNECT_RPC);

    this.RPC = rpc;

    let providerEngine = new Web3.providers.HttpProvider(this.RPC)
    this.web3 = new Web3(providerEngine);
  }
}

module.exports = Queryc;