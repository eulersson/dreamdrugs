import React from 'react';
import { hot } from 'react-hot-loader';
import './Toggle.css';

class Toggle extends React.Component {
  constructor() {
    super();
    this.state = {
      toggle: false
    }
    this.toggleClicked = this.toggleClicked.bind(this);
  }

  toggleClicked() {
    console.log('yay!');
    this.setState({ toggle: !this.state.toggle });
  }

  render() {
    return (
      <div id="Toggle" className={!!this.state.toggle ? 'toggled' : ''} onClick={this.toggleClicked}>
        <div id="bar1"></div>
        <div id="bar2"></div>
        <div id="bar3"></div>
      </div>
    );
  }
}

export default hot(module)(Toggle)
