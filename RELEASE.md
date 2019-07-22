# RELEASE LOG

## 1.0.9

### Fixes

* Specialize the mechanism of logout.

### Enhancements

* Quick development with `nodemon`.
* Support `Trust Wallet`. 🎉🎉🎉

---

## 1.0.8

### Fixes

* Hot fix cache

### Enhancements

* Remove `change` event from `watch` function.

---

## 1.0.7

### Fixes

* Cache addresses when deriving from root node.

### Enhancements

* None

---

## 1.0.6

### Fixes

* Fix bug `window.capsuleWallet.isConnected` undefined.
* Change `setInterval` to `filter('latest')` for efficient change detection.
* New `watch` function api.

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

* Return error when invalid private key

### Enhancements

* None

---

## 1.0.0 - 1.0.1 - 1.0.2

### Fixes

* Detach from [capsule-wallet](https://github.com/kambria-platform/capsule-wallet), now we can be served generally 🎉🎉🎉 hooray.
* The event `changed` in `watch` function now would be `change`.
* Storage now become `CAPSULE-JS-STORAGE` and `CAPSULE-JS-CACHE`. 
* Downgrade `ethereum-tx` to `1.3.7`.

### Enhancements

* Add tool test.