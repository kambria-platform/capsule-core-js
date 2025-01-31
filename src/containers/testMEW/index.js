import React, { Component } from 'react';
import WalletConnectQRCodeModal from "@walletconnect/qrcode-modal";
import { MEW } from 'capsule-core-js';
import Confirm from '../core/confirm';
import KAT from '../../helpers/kat';

const DEFAULT_STATE = {
  visible: false,
  waiting: false,
  network: null,
  account: null,
  balance: null,
  txId: null
}

class TestMEW extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
    this.options = {
      getApproval: this.getApproval,
      getAuthentication: this.getAuthentication
    }
  }

  getApproval = (params, callback) => {
    this.setState({
      visible: true,
      message: `From: ${params.from} / To: ${params.to} / Value: ${params.value}`,
      onCancel: () => {
        this.setState({ visible: false }, () => {
          return callback(null, false);
        });
      },
      onApprove: () => {
        this.setState({ visible: false }, () => {
          return callback(null, true);
        });
      }
    })
  }

  getAuthentication = {
    open: (code, callback) => {
      WalletConnectQRCodeModal.open(code, () => {
        return callback('User denied to connect', null);
      });
    },
    close: () => {
      WalletConnectQRCodeModal.close();
    }
  }

  connect = () => {
    this.mew = new MEW(4, this.options);
    this.mew.setAccountByMEW((er, web3) => {
      if (er) return console.error(er);
      this.kat = new KAT(web3);
      this.watcher = this.mew.watch((er, re) => {
        if (er) return console.error(er);
        return this.setState(re, () => {
          return this.kat.balanceOf(this.state.account).then(kat => {
            return this.setState({ kat });
          }).catch(er => {
            return console.error(er);
          });
        });
      });

    });
  }

  sendTx = () => {
    if (this.mew) this.mew.web3.eth.sendTransaction({
      from: this.state.account,
      to: this.state.account,
      value: '1000000000000000'
    }, (er, txId) => {
      if (er) return console.error(er);
      return console.log(txId);
    });
  }

  sendErc20Tx = () => {
    if (this.kat) this.kat.transfer(this.state.account, '1000000000000000000')
      .then(txId => {
        return console.log(txId);
      })
      .catch(er => {
        return console.error(er);
      });
  }

  logout = () => {
    if (this.mew) this.mew.logout();
  }

  componentWillUnmount() {
    if (this.watcher) this.watcher.stopWatching();
  }

  render() {
    return (
      <div>
        <h1>MEW Test</h1>
        <button onClick={this.connect}>Connect</button>
        <button onClick={this.sendTx}>Send 0.001 ETH</button>
        <button onClick={this.sendErc20Tx}>Send 1 KAT</button>
        <button onClick={this.logout}>Logout</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>ETH: {this.state.balance}</p>
        <p>KAT: {this.state.kat}</p>
        <Confirm
          open={this.state.visible}
          message={this.state.message}
          onClose={this.state.onCancel}
          onCancel={this.state.onCancel}
          onApprove={this.state.onApprove}
        />
      </div>
    );
  }
}

export default TestMEW;