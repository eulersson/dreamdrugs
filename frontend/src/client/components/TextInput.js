import React from 'react';
import { hot } from 'react-hot-loader'; 

import './TextInput.css';

function TextInput(props) {
  return (
    <input
      type="text"
      defaultValue={props.initial}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export default hot(module)(TextInput);
