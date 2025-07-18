import React from "react";
import PropTypes from "prop-types";

import "./TextInput.css";

function TextInput(props) {
  return (
    <input
      type="text"
      defaultValue={props.initial}
      onChange={e => props.onChange(e.target.value)}
    />
  );
}

TextInput.propTypes = {
  initial: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export default TextInput;
