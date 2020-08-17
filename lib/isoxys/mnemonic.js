var bip39 = require('bip39');
var HDKey = require('hdkey');
var util = require('../util');
var Privatekey = require('./privatekey')
const _default = require('../constant/default');

/**
 * Softwallet type
 */
let Mnemonic = {}

Mnemonic.mnemonicToSeed = (mnemonic, password, callback) => {
  bip39.mnemonicToSeed(mnemonic.trim(), password).then(seed => {
    return callback(seed);
  }).catch(er => {
    console.error(er);
    return callback(null);
  });
}

Mnemonic.seedToHDKey = (seed) => {
  if (!Buffer.isBuffer(seed)) {
    console.error('Seed must be type of buffer');
    return null;
  }
  return HDKey.fromMasterSeed(seed);
}

Mnemonic.hdkeyToAddress = (hdkey, dpath, index) => {
  dpath = dpath || _default.ETH_DERIVATION_PATH;
  dpath = util.addDPath(dpath, index);
  const child = hdkey.derive(dpath);
  const { address } = Privatekey.privatekeyToAccount(child.privateKey);
  return address;
}

Mnemonic.hdkeyToAccount = (hdkey, dpath, index) => {
  dpath = dpath || _default.ETH_DERIVATION_PATH;
  dpath = util.addDPath(dpath, index);
  const child = hdkey.derive(dpath);
  return Privatekey.privatekeyToAccount(child.privateKey);
}

module.exports = Mnemonic;