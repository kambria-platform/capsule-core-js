var TrezorConnect = require('trezor-connect').default;
var util = require('../util');
var cache = require('../storage').cache;
const error = require('../constant/error');
const _default = require('../constant/default');

// Register trezor manifest
TrezorConnect.manifest({
  email: 'phan.son.tu.1994@gmail.com',
  appUrl: 'https://github.com/sontuphan/capsule-wallet'
});

/**
 * Hardwallet type
 */
let TrezorOne = {}

TrezorOne.getAddress = (dpath, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);

  if (cache.get('trezorOne-address-' + dpath)) {
    let re = cache.get('trezorOne-address-' + dpath);
    return callback(null, re);
  }
  TrezorConnect.ethereumGetAddress({ path: dpath, showOnTrezor: false }).then(re => {
    if (!re.success) return callback(error.CANNOT_CONNECT_HARDWARE, null);

    cache.set('trezorOne-address-' + dpath, re.payload.address);
    return callback(null, re.payload.address);
  }).catch(er => {
    return callback(er, null);
  });
}

TrezorOne.getPublickey = (dpath, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);
  
  if (cache.get('trezorOne-root-' + dpath)) {
    let re = cache.get('trezorOne-root-' + dpath);
    return callback(null, re);
  }
  TrezorConnect.getPublicKey({ path: dpath, coin: 'eth' }).then(re => {
    if (!re.success) return callback(error.CANNOT_CONNECT_HARDWARE, null);

    cache.set('trezorOne-root-' + dpath, re.payload);
    return callback(null, re.payload);
  }).catch(er => {
    return callback(er, null);
  });
}

TrezorOne.signTransaction = (dpath, txParams, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);
  if (!txParams) return callback(error.INVALID_TX, null);

  txParams.gasLimit = txParams.gas;
  delete txParams["gas"];
  TrezorConnect.ethereumSignTransaction({
    path: dpath,
    transaction: txParams
  }).then(re => {
    if (!re.success) return callback(error.CANNOT_SIGN_TX, null);
    re.payload.r = util.unpadHex(re.payload.r);
    re.payload.s = util.unpadHex(re.payload.s);
    re.payload.v = util.unpadHex(re.payload.v);
    return callback(null, re.payload);
  }).catch(er => {
    return callback(er, null);
  });
}

module.exports = TrezorOne;