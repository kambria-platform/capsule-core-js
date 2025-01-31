import React, { Component } from 'react';
import { Trezor } from 'capsule-core-js';
import Confirm from '../core/confirm';
import Waiting from '../core/waiting';
import KAT from '../../helpers/kat';


const DEFAULT_STATE = {
  visible: false,
  waiting: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestTrezor extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
    this.options = {
      getWaiting: this.getWaiting,
      getApproval: this.getApproval
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

  getWaiting = {
    open: () => {
      this.setState({ waiting: true });
    },
    close: () => {
      this.setState({ waiting: false });
    }
  }


  connect = () => {
    this.trezor = new Trezor(4, this.options);
    this.trezor.getAccountsByTrezorOne("m/44'/60'/0'/0", 5, 0, (er, re) => {
      this.trezor.setAccountByTrezorOne("m/44'/60'/0'/0", 0, (er, web3) => {
        if (er) return console.error(er);
        this.kat = new KAT(web3);
        this.watcher = this.trezor.watch((er, re) => {
          if (er) return console.error(er);
          this.setState(re, () => {
            return this.kat.balanceOf(this.state.account).then(kat => {
              return this.setState({ kat });
            }).catch(er => {
              return console.error(er);
            });
          });
        });
      });
    });
  }

  sendTx = () => {
    if (this.trezor) this.trezor.web3.eth.sendTransaction({
      from: this.state.account,
      to: '0x5a926b235e992d6ba52d98415e66afe5078a1690',
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
    if (this.trezor) this.trezor.logout();
  }

  componentWillUnmount() {
    if (this.watcher) this.watcher.stopWatching();
  }

  render() {
    return (
      <div>
        <h1>Trezor Test</h1>
        <button onClick={this.connect}>Connect</button>
        <button onClick={this.sendTx}>Send 0.001 ETH</button>
        <button onClick={this.sendErc20Tx}>Send 1 KAT</button>
        <button onClick={this.logout}>Logout</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
        <p>KAT: {this.state.kat}</p>
        <Confirm
          open={this.state.visible}
          message={this.state.message}
          onClose={this.state.onCancel}
          onCancel={this.state.onCancel}
          onApprove={this.state.onApprove}
        />
        <Waiting open={this.state.waiting} />
      </div>
    );
  }
}

export default TestTrezor;