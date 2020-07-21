# RELEASE LOG

## 1.2.0 - 1.2.7

### Fixes

* Remove obsolete packages: `@walletconnect/browser`, `keytherum`.

### Enhancements

* Upgrade `web3` to version `1.x`.
* Apply new types of transactions due to hard-forks.

---

## 1.1.0 - 1.1.3

### Fixes

* Throw error when `setAccount` failed.

### Enhancements

* Restricted network will be `true` in all cases. You cannot be able to config.
* Self-define the type of wallet.
* Allow `approveTransaction` and `waitTransaction` in config.

---

## 1.0.11

### Fixes

* Using `mainnet` as the default network.

### Enhancements

* None.

---

## 1.0.10

### Fixes

* None.

### Enhancements

* Support browser refreshing to `Trust Wallet`. 🎉🎉🎉

---

## 1.0.9

### Fixes

* Specialize the mechanism of logout.

### Enhancements

* Quick development with `nodemon`.
* Support `Trust Wallet`. 🎉🎉🎉

---

## 1.0.8

### Fixes

* Hot fix cache.

### Enhancements

* Remove `change` event from `watch` function.

---

## 1.0.7

### Fixes

* Cache addresses when deriving from the root node.

### Enhancements

* None.

---

## 1.0.6

### Fixes

* Fix bug `window.capsuleWallet.isConnected` undefined.
* Change `setInterval` to `filter('latest')` for efficient change detection.
* New `watch` api function.

```
let watcher = this.<wallet>.watch((er, re) => {
  if(er) return console.error(er);

  // Called only when having a change.
  console.log(re);
});

// Stop watching
watcher.stopWatching();
```

### Enhancements

* Add `logout` wallet function.

---

## 1.0.5: UNPUBLISHED

---

## 1.0.4

### Fixes

* Using arrow function, the code no longer needed `self = this` for functions.

### Enhancements

* Add `NonWallet` type. In case you would like to fetch some info from blockchain without account association, `NonWallet` is for you.

---

## 1.0.3

### Fixes

* Return error when invalid private key.

### Enhancements

* None.

---

## 1.0.0 - 1.0.1 - 1.0.2

### Fixes

* Detach from [capsule-wallet](https://github.com/kambria-platform/capsule-wallet), now we can be served generally 🎉🎉🎉 hooray.
* The event `changed` in `watch` function now would be `change`.
* Storage now become `CAPSULE-JS-STORAGE` and `CAPSULE-JS-CACHE`. 
* Downgrade `ethereum-tx` to `1.3.7`.

### Enhancements

* Add tool test.