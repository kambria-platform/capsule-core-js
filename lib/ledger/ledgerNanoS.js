var Eth = require('@ledgerhq/hw-app-eth').default;
var TransportU2F = require('@ledgerhq/hw-transport-u2f').default;
var TransportWebUSB = require('@ledgerhq/hw-transport-webusb').default;
var cache = require('../storage').cache;
var util = require('../util');
const error = require('../constant/error');
const _default = require('../constant/default');

/**
 * Hardwallet type
 */
let LedgerNanoS = {}

LedgerNanoS.getAddress = (dpath, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);

  if (cache.get('ledgerNanoS-address-' + dpath)) {
    let re = cache.get('ledgerNanoS-address-' + dpath);
    return callback(null, re);
  }
  LedgerNanoS.getCommunication((er, eth) => {
    if (er) return callback(er, null);

    eth.getAddress(dpath, false, true).then(re => {
      if (!re || !re.address) return callback(error.CANNOT_CONNECT_HARDWARE, null);

      cache.set('ledgerNanoS-address-' + dpath, re.address);
      return callback(null, re.address);
    }).catch(er => {
      return callback(er, null);
    });
  });
}

LedgerNanoS.getPublickey = (dpath, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);

  if (cache.get('ledgerNanoS-root-' + path)) {
    let re = cache.get('ledgerNanoS-root-' + path);
    return callback(null, re);
  }
  LedgerNanoS.getCommunication((er, eth) => {
    if (er) return callback(er, null);

    eth.getAddress(dpath, false, true).then(re => {
      if (!re || !re.address) return callback(error.CANNOT_CONNECT_HARDWARE, null);

      cache.set('ledgerNanoS-root-' + dpath, re);
      return callback(null, re);
    }).catch(er => {
      return callback(er, null);
    });
  });
}

LedgerNanoS.signTransaction = (dpath, txParams, callback) => {
  dpath = dpath || util.addDPath(_default.ETH_DERIVATION_PATH, _default.ACCOUNT_INDEX);
  if (!txParams) return callback(error.INVALID_TX, null);

  let tx = util.genRawTx(txParams);
  let rawTx = util.unpadHex(tx.hex);
  LedgerNanoS.getCommunication((er, eth) => {
    if (er) return callback(er, null);

    eth.signTransaction(dpath, rawTx).then(re => {
      if (!re) return callback(error.CANNOT_CONNECT_HARDWARE, null);

      return callback(null, re);
    }).catch(er => {
      return callback(er, null);
    });
  });
}

LedgerNanoS.getCommunication = (callback) => {
  if (LedgerNanoS.eth) return callback(null, LedgerNanoS.eth);

  LedgerNanoS.getTransport((er, transport) => {
    if (er) return callback(er, null);

    LedgerNanoS.eth = new Eth(transport);
    return callback(null, LedgerNanoS.eth);
  });
}

LedgerNanoS.getTransport = (callback) => {
  let webusbSupported = false;
  let u2fSupported = false;

  TransportWebUSB.isSupported().then(re => {
    webusbSupported = re;
    return TransportU2F.isSupported();
  }).then(re => {
    u2fSupported = re;
    if (u2fSupported) return TransportU2F.create();
    if (webusbSupported) return TransportWebUSB.create();
    return callback(error.UNSUPPORT_HARDWARE, null);
  }).then(transport => {
    return callback(null, transport);
  }).catch(er => {
    return callback(er, null);
  });
}

LedgerNanoS.closeTransport = (transport) => {
  return transport.close();
}

module.exports = LedgerNanoS;