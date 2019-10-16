import React from "react";
import PropTypes from "prop-types";

import "./Toggle.css";

function Toggle(props) {
  return (
    <div
      id="Toggle"
      className={props.switch ? "toggled" : ""}
      onClick={props.onChange}
    >
      <div id="bar1" />
      <div id="bar2" />
      <div id="bar3" />
    </div>
  );
}

Toggle.propTypes = {
  switch: PropTypes.bool,
  onChange: PropTypes.func
};

export default Toggle;
