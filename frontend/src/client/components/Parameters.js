/* global console, module */

import React from "react";
import { hot } from "react-hot-loader";

import "./Parameters.css";

import Checkbox from "./Checkbox";
import Dropdown from "./Dropdown";
import Slider from "./Slider";
import TextInput from "./TextInput";

class Parameters extends React.Component {
  onValueChanged = (parameterName, newValue, type) => {
    console.log(`Parameter ${parameterName} changed: ${newValue}`);
    switch (type) {
      case "bool":
        newValue = newValue === "true";
        break;
      case "int":
        newValue = parseInt(newValue);
        break;
      case "float":
        newValue = parseFloat(newValue);
        break;
      case "default":
        break;
    }

    // To be asynchronously safe make a copy of the current parameters.
    const parameters = {
      ...this.props.parameters
    };

    // Edit the one parameter we changed the value for...
    parameters[parameterName] = newValue;

    /// ... and update the state above.
    this.props.setParameters(this.props.model, parameters);
  };

  render() {
    // Signature gives us information about what kind of data parameters take.
    const parameters = this.props.signature;

    // Construct widgets according to the type and validations.
    const parameterWidgets = Object.keys(parameters).map(parameterName => {
      const parameter = parameters[parameterName];
      let defaultValue = parameter.default;
      if (
        Object.keys(this.props.parameters).length > 0 &&
        !!this.props.parameters[parameterName]
      ) {
        defaultValue = this.props.parameters[parameterName];
      }

      const validation = parameter.validation;
      const validationKeys = Object.keys(validation);

      let Widget;
      if (validationKeys.includes("range")) {
        Widget = Slider;
      } else if (validationKeys.includes("choices")) {
        Widget = Dropdown;
      } else {
        if (validation.type === "bool") {
          Widget = Checkbox;
        } else {
          Widget = TextInput;
        }
      }

      // TODO: Pretty names for parameters.
      function prettify(name) {
        return name
          .split("_")
          .map(item => item.charAt(0).toUpperCase() + item.slice(1))
          .join(" ");
      }
      return (
        <Widget
          prettyName={prettify(parameterName)}
          name={parameterName}
          key={parameterName}
          initial={defaultValue}
          onChange={newValue =>
            this.onValueChanged(parameterName, newValue, validation.type)
          }
          {...validation}
        />
      );
    });

    return (
      <div id="Parameters">
        <Dropdown
          prettyName="Models"
          name="models"
          choices={this.props.models}
          initial={this.props.model}
          onChange={this.props.onModelChanged}
        />
        <div id="parameters-layout">{parameterWidgets}</div>
      </div>
    );
  }
}

export default hot(module)(Parameters);
