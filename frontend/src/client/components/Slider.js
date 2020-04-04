import React from "react";
import PropTypes from "prop-types";

import "./Slider.css";

class Slider extends React.Component {
  state = {
    current: ""
  };

  constructor(props) {
    super(props);
    this.onSliderMove = this.onSliderMove.bind(this);
  }

  componentDidMount() {
    this.setState({
      current: this.props.initial === null ? "None" : this.props.initial
    });
  }

  onSliderMove(value) {
    this.setState({ current: value });
    this.props.onChange(value);
  }

  render() {
    const min = this.props.range[0];
    const max = this.props.range[1];
    const step = this.props.type === "int" ? 1 : (max - min) / 10;
    return (
      <div className="widget">
        <div className="reader">
          <span>
            <b>{this.props.prettyName}</b>:
          </span>
          <div>{this.state.current}</div>
        </div>
        <div className="slidecontainer">
          <input
            type="range"
            className="slider"
            name={this.props.name}
            min={min}
            max={max}
            step={step}
            defaultValue={this.props.initial}
            onChange={e => this.onSliderMove(e.target.value)}
          />
        </div>
      </div>
    );
  }
}

Slider.propTypes = {
  initial: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  prettyName: PropTypes.string.isRequired,
  range: PropTypes.arrayOf(PropTypes.number).isRequired,
  type: PropTypes.oneOf(["int", "float"]).isRequired
};

export default Slider;
