import React from "react";
import PropTypes from "prop-types";

import "./Checkbox.css";

function Checkbox(props) {
  return (
    <label className="container">
      {props.prettyName}
      <input name={props.name} type="checkbox" />
      <span className="checkmark"></span>
    </label>
  );
}

Checkbox.propTypes = {
  name: PropTypes.string,
  prettyName: PropTypes.string
};

export default Checkbox;
