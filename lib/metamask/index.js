var WalletInterface = require('../interface/walletInterface');
var util = require('../util');
var Web3 = require('web3');

const ERROR = require('../constant/error');

class Metamask extends WalletInterface {
  constructor(net) {
    super(net, 'softwallet');
  }

  setAccountByMetamask = (callback) => {
    this.provider = window.ethereum;
    if (!this.provider)
      return callback(ERROR.CANNOT_FOUND_PROVIDER, null);

    return this.provider.request({ method: 'net_version' }).then(netId => {
      if (util.getNetworkId(netId, 'number') != util.getNetworkId(this.net, 'number'))
        return callback(ERROR.INVALID_NETWORK, null);

      this.web3 = new Web3(this.provider);
      return this.provider.request({ method: 'eth_requestAccounts' }).then(re => {
        this.web3.killSession = this.killSession;
        return callback(null, this.web3);
      }).catch(er => {
        return callback(er, null);
      });
    }).catch(er => {
      return callback(er, null);
    });
  }

  killSession = () => { /* Do nothing, just for consistent API */ }
}

module.exports = Metamask;