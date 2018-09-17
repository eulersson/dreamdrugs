import React from 'react';
import { hot } from 'react-hot-loader';
import './Toggle.css';

function Toggle(props) {
  return (
    <div
      id="Toggle"
      className={!!props.switch ? 'toggled' : ''}
      onClick={props.onChange}>
      <div id="bar1"></div>
      <div id="bar2"></div>
      <div id="bar3"></div>
    </div>
  );
}
    

export default hot(module)(Toggle)
