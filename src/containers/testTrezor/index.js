import React, { Component } from 'react';
import { Trezor } from 'capsule-js';

const DEFAULT_STATE = {
  visible: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
  error: null
}

class TestTrezor extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;

    console.log(Trezor)
  }

  render() {
    return (
      <div>
        <h1>Trezor Test</h1>
      </div>
    );
  }
}

export default TestTrezor;