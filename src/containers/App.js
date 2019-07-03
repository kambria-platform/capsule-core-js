import React, { Component } from 'react';
import { BrowserRouter, Route, Link, Switch, Redirect } from 'react-router-dom';

import TestMetamask from './testMetamask';
import TestIsoxys from './testIsoxys';
import TestMEW from './testMEW';
import TestLedger from './testLedger';
import TestTrezor from './testTrezor';
import TestNonWallet from './testNonWallet';

const margin = { marginRight: '10px' }

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <header>
            <Link style={margin} to='/metamask'>Test Metamask</Link>
            <Link style={margin} to='/isoxys'>Test Isoxys</Link>
            <Link style={margin} to='/mew'>Test MEW</Link>
            <Link style={margin} to='/ledger'>Test Ledger</Link>
            <Link style={margin} to='/trezor'>Test Trezor</Link>
            <Link style={margin} to='/nonwallet'>Test NonWallet</Link>
          </header>
          <main>
            <Switch>
              <Redirect exact from='/' to='/metamask' />
              <Route exact path='/metamask' component={TestMetamask} />
              <Route exact path='/isoxys' component={TestIsoxys} />
              <Route exact path='/mew' component={TestMEW} />
              <Route exact path='/ledger' component={TestLedger} />
              <Route exact path='/trezor' component={TestTrezor} />
              <Route exact path='/nonwallet' component={TestNonWallet} />
            </Switch>
          </main>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
