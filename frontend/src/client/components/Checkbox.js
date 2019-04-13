/* global module */

import React from "react";
import { hot } from "react-hot-loader";

import "./Checkbox.css";

function Checkbox(props) {
  return (
    <label className="container">{props.prettyName}
      <input name={props.name} type="checkbox" />
      <span className="checkmark"></span>
    </label>
  );
}

export default hot(module)(Checkbox);
