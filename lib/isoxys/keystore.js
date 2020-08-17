var Web3 = require('web3');
var util = require('../util');

/**
 * Softwallet type
 */
var Keystore = {}

Keystore.recover = (input, password, callback) => {
  const web3 = new Web3();
  try {
    const wallet = web3.eth.accounts.wallet.decrypt([input], password);
    if (!wallet || !wallet[0]) return callback(null);
    const { address, privateKey } = wallet[0];
    return callback({ address: address.toLowerCase(), privateKey: util.unpadHex(privateKey) });
  } catch (er) {
    return callback(null);
  }
}

module.exports = Keystore;